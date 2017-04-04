import React, {Component} from 'react';
import _ from 'lodash';
import moment from 'moment';

import Loader from './loader';
import {
    initShowFlyInfo,
    initScrollOffers,
    numberFormat,
} from '../tools/tools';


export default class SearchResultHotel extends Component {

    constructor(props) {
        console.log('SearchResultHotel constructor');
        super(props);

        this.curDate = window.RuInturistStore.initForm.dateFrom
        this.NTK_PACk_TYPES = window.RuInturistStore.NTK_PACk_TYPES;
        this.NTK_API_IN = window.RuInturistStore.NTK_API_IN;
        this.LL_API_IN = window.RuInturistStore.LL_API_IN;
        this.USER_FAV = window.RuInturistStore.USER_FAV;
        this.ajaxUrl = '/tour-search/ajax.php';

        this.arXHRs = [];

        this.state = {
            arXHR: [],
            SEARCH: {},
            isLLCompleted: this.LL_API_IN ? false : true,
            isNtkCompleted: Object.keys(this.NTK_PACk_TYPES).length * -1,
            dates: [],
            packs: [],
            offers: [],
            datePackMinPrice: {},
            selectedDate: this.curDate,
            selectedPack: this.NTK_PACk_TYPES[0].id || this.NTK_PACk_TYPES[1].id,
            isSearchWasStarted: false,
        }
    }

    componentDidMount() {
        this.getNTKHotelOffers();
        this.getLLHotelOffers();

        initShowFlyInfo();
        initScrollOffers();

    }

    componentDidUpdate() {
        initScrollOffers();
    }

    resultsHandler(offers, pack) {
        moment.lang('ru');

        offers = [...this.state.offers, ...offers]
        let datePackMinPrice = Object.assign({}, ...this.state.datePackMinPrice);

        // dates
        let dates = [...this.state.dates];

        offers.forEach((offer, i, arr) => {

            arr[i].packId = pack.id;

            if ('NTK' === offer.source) {
                arr[i].optionCode = offer.source + offer.PriceKey;
            } else if ('LL' === offer.source) {
                arr[i].optionCode = offer.source + offer.tour_id;
            }


            const {TourDate} = offer;

            if (!TourDate) return;

            let momentDate = moment(TourDate, 'YYYY.MM.DD');

            dates.push({
                origFormatted: momentDate.format('DD.MM.YYYY'),
                ts: +momentDate.format('X'),
                dayOfWeek: momentDate.format('dddd'),
                dayAndMonth: momentDate.format('D MMMM'),
            });


            const datePackMinPriceId = `${TourDate}_${pack.id}`;
            if (!datePackMinPrice[datePackMinPriceId]) {
                datePackMinPrice[datePackMinPriceId] = offer.Price;
            } else if (datePackMinPrice[datePackMinPriceId] > offer.Price) {
                datePackMinPrice[datePackMinPriceId] = offer.Price;
            }
        });

        dates = _.uniqBy(dates, 'dayAndMonth');
        dates = dates.sort((i, j) => i.ts - j.ts);
        // dates fin


        //packs fin
        let packs = _.uniqBy([...this.state.packs, pack], 'value_ext');
        //packs fin

        offers.sort((i, j) => i.Price - j.Price);


        console.log('==============================');
        console.log('offers: ', offers);
        console.log('==============================');

        this.setState({
            dates,
            packs,
            offers,
            datePackMinPrice,
        });

    }

    getNTKHotelOffers() {

        if (this.NTK_API_IN.Destination) {
            this.setState({isSearchWasStarted: true});

            this.NTK_PACk_TYPES.forEach((pack) => {

                let _pack = {FlightType: pack.FlightType, HasFlights: pack.HasFlights};

                const NTK_API_IN = {...this.NTK_API_IN, ..._pack};

                let xhr = $.ajax({
                    url: this.ajaxUrl,
                    data: {
                        getHotelOffers: 'Y',
                        NTK_API_IN: NTK_API_IN,
                        origUrl: document.location.href
                    },
                    dataType: 'json',
                    cache: false,
                }).done(data => {

                    if (data) {
                        this.resultsHandler(data, pack);
                    }

                });

                this.arXHRsPush(xhr);
            });
        }
    }


    render() {

        let {
            dates,
            packs,
            offers,
            selectedDate,
            selectedPack,

            isSearchWasStarted,
            isLLCompleted,
            isNtkCompleted,
        } = this.state;

        // если

        console.log('+++++++++++++++++++++++++++++++++');
        console.log('isNtkCompleted: ',isNtkCompleted);
        console.log('isLLCompleted: ',isLLCompleted);
        console.log('isSearchWasStarted: ',isSearchWasStarted);
        console.log('offers.length: ',offers.length);
        console.log('+++++++++++++++++++++++++++++++++');


        if (!offers.length || !packs.length || !dates.length) {
            return (
                <div className="row hotel-propositions">
                    <h2 className="title-hotel">Предложения по отелю</h2>

                    {(isSearchWasStarted && !(isLLCompleted || isNtkCompleted >= 0)) ?
                        <div className="flex loader-wp"><Loader /></div>
                            : ''}
                    {(!offers.length && isSearchWasStarted && isLLCompleted && isNtkCompleted >= 0) ?
                        <h2 className="title-hotel">Ничего не найдено</h2>
                    : ''}
                </div>
            );
        }

        packs = packs.sort((i, j) => i.id == 1 ? -1 : 2);

        // prepare min price
        packs = this.preparePacksMinPrice(offers, packs);


        offers = offers.filter(offer => offer.TourDateDDMMYYYY == selectedDate && selectedPack == offer.packId);


        console.log('/***********************************/');
        console.log('render');
        console.log('offers: ', offers);
        console.log('/***********************************/');

        return (
            <div className="row hotel-propositions">
                <h2 className="title-hotel">Предложения по отелю</h2>
                <div className="flex">
					<span className="-col-4 -date">
						<div className="wrapper">
							<div className="title">Дата заезда:</div>
							<div className="options">
								{dates.map(date => {
                                    const {origFormatted, ts, dayOfWeek, dayAndMonth} = date;
                                    const active = origFormatted === selectedDate;
                                    return (
                                        <div data-tourdate={origFormatted}
                                             key={ts}
                                             className={"options-item " + (active ? ' slick-current ' : '')}
                                             onClick={() => this.setDate(origFormatted)}
                                        >
                                            <div className="options-item-inner">
                                                <span className="date">{dayAndMonth}</span>
                                                <span className="week">{dayOfWeek}</span>
                                            </div>
                                        </div>
                                    );
                                })}
							</div>
						</div>
					</span>
                    <span className="-col-4 -type">
                        <div className="wrapper">
                            <div className="title">Выберите тип тура:</div>
                            <div className="options">
                                {packs.map((pack, idx) => {
                                    const {id, value_ext, minPricePrint} = pack;
                                    const active = id === selectedPack;
                                    return (
                                        <div key={idx}
                                             className={"options-item " + (active ? ' slick-current ' : '')}
                                             onClick={() => this.setPack(id)}
                                        >
                                            <div className="options-item-inner">
                                                <span className="type">{value_ext}</span>
                                                {minPricePrint ?
                                                    <span className="option">от {minPricePrint} <span
                                                        className="rub">₽</span></span>
                                                    : <span className="option">Нет предложений</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </span>
                    {this.renderOffers(offers)}

                </div>
            </div>
        );

    }


    renderOptions(options) {

        const {
            isErrorLoading,
            isFlight,
            isMed,
            isTransfer,
            isfuelCharge,
            fuelChargeValue,
            flightDetails,
            source,
        } = options;

        if(isErrorLoading){
            return (
                <div className="options">Ошибка при загрузке</div>
            );
        }

        return (
            <div className="options">
                <div className="label show-mobile">Состав тура</div>

                {isFlight ?
                    <div>
                        <div className="option positive">
                            <span className="icon-ok"></span>
                            <div className="fly-info">Пререлёт</div>
                        </div>

                        {this.renderFilghtDetails(flightDetails, source)}
                    </div>
                : ''}

                <div className="option positive">
                    <span className="icon-ok"></span>Проживание
                </div>

                {isMed ?
                    <div className="option positive">
                        <span className="icon-ok"></span>Страховка
                    </div>
                : ''}

                {isTransfer ?
                    <div className="option positive">
                        <span className="icon-ok"></span>Трансфер
                    </div>
                : ''}

                {isfuelCharge ?
                    <div className="option negative">
                        <span className="icon-cross"></span>Топливный сбор
                        <span className="nowrap"> {fuelChargeValue} <span className="rub">Р</span></span>
                    </div>
                : ''}
            </div>
        );
    }


    arXHRsPush(xhr) {
        this.arXHRs.push(xhr);
    }

    isAllXHRCompleted() {
        return this.arXHRs.every(i => i.readyState === 4)
    }

    setLLAsFinished() {
        this.setState({chkLTResNum: 777, isLLCompleted: false});
    }

    setDate(selectedDate) {
        this.setState({selectedDate});
    }

    setPack(selectedPack) {
        this.setState({selectedPack});
    }

    preparePacksMinPrice(offers, packs) {

        packs.forEach((pack, i, packs) => {
            packs[i].minPrice = null;
            packs[i].minPricePrint = null;
        });

        offers.forEach(offer => {
            packs.forEach((pack, i, packs) => {
                if (packs[i].id === offer.packId) {
                    if (!packs[i].minPrice) {
                        packs[i].minPrice = offer.Price;
                    } else if (packs[i].minPrice > offer.Price) {
                        packs[i].minPrice = offer.Price
                    }
                }
            });
        });

        packs.forEach((pack, i, packs) => {
            if (packs[i].minPrice) {
                packs[i].minPricePrint = numberFormat(packs[i].minPrice, 0, '', ' ');
            }
        });

        return packs;
    }

    renderOffers(offers) {

        if (!offers.length) {
            return (
                <span className="-col-2 -propositions">
                <div className="propositions-wrapper">
                    Предложений не найдено
                </div>
            </span>
            )
        }

        return (
            <span className="-col-2 -propositions">
                <div className="propositions-wrapper">
                    <div className="scroll-header tab-wrapper -proposition">
                        <div className="-middle">
                            <span className="room">Номер</span>
                            <span className="type">Тип</span>
                            <span className="eat">Питание</span>
                            <span className="consist">Состав тура</span>
                        </div>
                    </div>
                    <div className="scroll-content">

                        {offers.map((offer, idx) => {

                            return (
                                <div key={idx} className="hotel-item">
                                    <div className="tab-wrapper -proposition">
                                        <div className="-middle">
                                            <span className="room">
                                                <strong>{offer.RoomType}</strong>
                                            </span>
                                            <span className="type">
                                                <div className="label show-mobile">Тип тура</div>
                                                <span className="icon-one-people"></span>
                                                <span className="icon-one-people"></span>
                                            </span>
                                            <span className="eat">
                                                <div className="label show-mobile">Питание</div>
                                                {offer.Room} ({offer.RoomType})
                                            </span>
                                            <span className="consist">
                                                <div className="-wrapper">
                                                    <div className="buy">
                                                        <span className="buy-wrapper">
                                                            {offer.source === 'NTK' ? 'купить' : 'забронировать'}
                                                            <span className="price">{offer.pricePrint} <span
                                                                className="rub">Р</span> </span>
                                                        </span>
                                                    </div>
                                                    {this.renderOptionBlock(offer)}
                                                    {offer.source === 'NTK' ? <div className="logo"></div> : ''}
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            );
                        })}
                    </div>
                    <div className="scroll-bottom">
                        <span className="icon-arrow-bottom"></span>
                    </div>
                    <div className="show-more show-mobile">
                        <span className="text">Показать еще</span>
                        <span className="icon-arrow-bottom"></span>
                    </div>
                </div>
            </span>
        )
    }


    getLLHotelOffers() {

        const pack = this.NTK_PACk_TYPES.filter(i => i.id === 1)[0];


        if (this.LL_API_IN) {
            this.setState({isSearchWasStarted: true});

            let xhr = $.ajax({
                url: '/tour-search/ajax.php',
                data: {
                    LL_API_IN: this.LL_API_IN,
                    ajax: 'Y',
                    getHotelOffers: 'Y',
                },
                dataType: 'json',
                cache: false,
            }).done((data) => {

                if (data) {
                    this.resultsHandler(data, pack);
                }

                this.setState({isLLCompleted: true});
            });

            this.arXHRsPush(xhr);

        }
    }


    getOptions(offer) {
        let optionCode = null;
        let data = {};

        if ('NTK' === offer.source) {
            // todo////
            optionCode = offer.source + offer.PriceKey;
            data.WhatGet = 'getTourDetailNTK';
            data.PriceKey = offer.PriceKey;
            data.AmountOfInfants = offer.amount_of_infants

        } else if ('LL' === offer.source) {
            optionCode = offer.source + offer.tour_id;

            data.WhatGet = 'getTourDetailLL';
            data.tour_id = offer.tour_id;
            data.LL_REQUEST_ID = offer.request_id;

        }

        console.log('optionCode: ');


        let offers = [...this.state.offers];

        let offerIdx = null;

        for (let i in offers) {
            if (offers[i].optionCode == optionCode) {
                offerIdx = i;
                break;
            }
        }


        if (offerIdx !== null) {

            if (data.WhatGet) {
                $.ajax({
                    url: '/local/ajax/tour-search.php',
                    data: data,
                    cache: false,
                    dataType: 'json',
                    beforeSend: () => {
                        offers[offerIdx].optionStatus = 'loading';

                        this.setState({
                            offers: offers
                        })

                    }
                }).done((res) => {

                    let options = {
                        isErrorLoading: false,
                        isFlight: false,
                        isMed: false,
                        isTransfer: false,
                        isfuelCharge: false,
                        fuelChargeValue: null,
                        flightDetails: null,

                    };


                    if (data.WhatGet === 'getTourDetailLL') {
                        options.source = 'LL';

                        if (res instanceof Object && res.success) {
                            if(res.medical_insurance){
                                options.isMed = true;
                            }

                            if(res.transfer){
                                options.isTransfer = true;
                            }

                            if(res.flights instanceof Array && res.flights.length > 0){
                                options.isFlight = true;
                                options.isfuelCharge = !!res.flights[0].fuel_charge;
                                options.flightDetails = res.flights[0];

                                if(options.isfuelCharge){
                                    options.fuelChargeValue = numberFormat(res.flights[0].fuel_charge, 0, '', ' ');
                                }
                            }
                        }else{
                            options.isErrorLoading = true;
                        }

                    } else if (data.WhatGet === 'getTourDetailNTK') {

                        if(res instanceof Object){
                            options.source = 'NTK';

                            options = Object.assign({}, options, res)
                        }else{
                            options.isErrorLoading = true;
                        }
                    }

                    offers[offerIdx].optionStatus = 'loaded';
                    offers[offerIdx].options = options;

                    this.setState({offers: offers});

                });
            }


        }

    }


    renderOptionBlock(offer) {
        const {optionStatus, options} = offer;

        if (!optionStatus) {
            return (
                <div className="show-options"
                     onClick={() => this.getOptions(offer)}
                >
                    <div className="icon-list-tour"></div>
                    <div className="text">Посмотреть состав</div>
                </div>
            );
        }


        if (optionStatus == 'loading') {
            return (
                <div className="show-options">
                    <div className="icon-list-tour"></div>
                    <div className="text">Загрузка</div>
                </div>
            );
        }


        return this.renderOptions(options)
    }


    renderFilghtDetails(flightDetails, source){

        console.log('=========================');
        console.log('renderFilghtDetails: ');
        console.log('flightDetails: ',flightDetails);
        console.log('flightDetails.back: ',flightDetails.back);
        console.log('flightDetails.to: ',flightDetails.to);
        console.log('=========================');




        if(source === 'LL'){

            if(!flightDetails || !flightDetails.back || !flightDetails.to) return;

            moment.lang('ru');

            const {to, back} = flightDetails;
            const dateFormat = 'DD MMMM YYYY в H:mm';

            let toPrint = {
                departure: moment(to.departure).format(dateFormat),
                arrival: moment(to.arrival).format(dateFormat),
                flight_no: to.flight_no,
                name: to.airline.name || ' - ',
                title: `${to.origin.city.name} (${to.origin.code}) - ${to.destination.city.name} (${to.destination.code})`,

            }

            let backPrint = {
                arrival: moment(back.arrival).format(dateFormat),
                departure: moment(back.departure).format(dateFormat),
                flight_no: back.flight_no,
                name: back.airline.name || ' - ',
                title: `${back.origin.city.name} (${back.origin.code}) - ${back.destination.city.name} (${back.destination.code})`,
            }

            return (
                <div className="fly-view hidden">
                    <div className="fly-view--inner">
                        <div className="fly-view--to">
                            <div className="fly-view--direction">{toPrint.title}</div>
                            <div className="fly-view--data">Отправление: {toPrint.departure}</div>
                            <div className="fly-view--data">Перевозчик: {toPrint.name}</div>
                            <div className="fly-view--data">Рейс: {toPrint.flight_no}</div>
                            <div className="fly-view--data">Прибытие: {toPrint.arrival}</div>
                        </div>
                        <div className="fly-view--from">
                            <div className="fly-view--direction">{backPrint.title}</div>
                            <div className="fly-view--data">Отправление: {backPrint.departure}</div>
                            <div className="fly-view--data">Перевозчик: {backPrint.name}</div>
                            <div className="fly-view--data">Рейс: {backPrint.flight_no}</div>
                            <div className="fly-view--data">Прибытие: {backPrint.arrival}</div>
                        </div>
                        <div className="delimeter"></div>
                    </div>
                </div>
            );
        }

        if(source =='NTK'){

            // заглушка до момента доработки API
            return (
                <div className="fly-view hidden">
                    <div className="fly-view--inner">
                        Информацию о перелетах просим уточнить у наших менеджеров по телефону +7(495) 730-19-80
                    </div>
                </div>
            );


            // начальный блок
            return (
                <div className="fly-view hidden">
                    <div className="fly-view--inner">
                        <div className="fly-view--to">
                            <div className="fly-view--direction">[NTK TODO] Москва (DME) - Даламан (DLM)</div>
                            <div className="fly-view--data">Отправление: 12 мая 2017 в 6:00</div>
                            <div className="fly-view--data">Перевозчик: VIM Airlines</div>
                            <div className="fly-view--data">Рейс: NN9303 (Airbus A-300)</div>
                            <div className="fly-view--data">Прибытие: 12 мая 2017 в 6:45</div>
                        </div>
                        <div className="fly-view--from">
                            <div className="fly-view--direction">[NTK TODO] Даламан (DLM) - Москва (DME)</div>
                            <div className="fly-view--data">Отправление: 15 мая 2017 в 6:00</div>
                            <div className="fly-view--data">Перевозчик: VIM Airlines</div>
                            <div className="fly-view--data">Рейс: NN9303 (Airbus A-300)</div>
                            <div className="fly-view--data">Прибытие: 15 мая 2017 в 16:45</div>
                        </div>
                        <div className="delimeter"></div>
                    </div>
                </div>
            );
        }

    }

}