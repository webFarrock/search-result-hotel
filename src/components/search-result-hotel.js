import React, {Component} from 'react';
import _ from 'lodash';
import {
    initDateSlick,
    initTypeSlick,
    numberFormat
} from '../tools/tools';
import moment from 'moment';

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
            isLLCompleted: !!this.LL_API_IN,
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

        console.log('this.LL_API_IN: ', this.LL_API_IN);


    }

    componentDidUpdate() {

    }

    resultsHandler(offers, pack) {
        moment.lang('ru');

        offers = [...this.state.offers, ...offers]
        let datePackMinPrice = Object.assign({}, ...this.state.datePackMinPrice);

        // dates
        let dates = [...this.state.dates];

        offers.forEach((offer, i, arr) => {

            arr[i].packId = pack.id;

            if('NTK' === offer.source){
                arr[i].optionCode = offer.source + offer.priceKey;
            } else if('LL' === offer.source){
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
            selectedPack
        } = this.state;

        if (!offers.length || !packs.length || !dates.length) {
            return (
                <div className="row hotel-propositions">
                    <h2 className="title-hotel">Предложения по отелю</h2>
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


    renderOptions() {
        return (
            <div className="options">
                <div className="label show-mobile">Состав тура</div>
                <div className="option positive">
                    <span className="icon-ok"></span>
                    <div className="fly-info">Пререлёт</div>
                </div>
                <div className="fly-view hidden">
                    <div className="fly-view--inner">
                        <div className="fly-view--to">
                            <div className="fly-view--direction">Москва (DME) - Даламан (DLM)</div>
                            <div className="fly-view--data">Отправление: 12 мая 2017 в 6:00</div>
                            <div className="fly-view--data">Перевозчик: VIM Airlines</div>
                            <div className="fly-view--data">Рейс: NN9303 (Airbus A-300)</div>
                            <div className="fly-view--data">Прибытие: 12 мая 2017 в 6:45</div>
                        </div>
                        <div className="fly-view--from">
                            <div className="fly-view--direction">Даламан (DLM) - Москва (DME)</div>
                            <div className="fly-view--data">Отправление: 15 мая 2017 в 6:00</div>
                            <div className="fly-view--data">Перевозчик: VIM Airlines</div>
                            <div className="fly-view--data">Рейс: NN9303 (Airbus A-300)</div>
                            <div className="fly-view--data">Прибытие: 15 мая 2017 в 16:45</div>
                        </div>
                        <div className="delimeter"></div>
                    </div>
                </div>
                <div className="option positive">
                    <span className="icon-ok"></span>Проживание
                </div>
                <div className="option positive">
                    <span className="icon-ok"></span>Трансфер
                </div>
                <div className="option negative">
                    <span className="icon-cross"></span>Топливный сбор
                    <span className="nowrap">4 500 <span className="rub">Р</span></span>
                </div>
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


    getOptions(offer){
        let optionCode = null;
        let data = {};

        if('NTK' === offer.source){
            // todo////
            optionCode = offer.source + offer.priceKey;
            data.WhatGet = 'getTourDetailNTK';
            data.price_key = offer.priceKey;
            data.amount_of_infants = offer.amount_of_infants

        }else if('LL' === offer.source){
            optionCode = offer.source + offer.tour_id;

            data.WhatGet = 'getTourDetailLL';
            data.tour_id = offer.tour_id;
            data.LL_REQUEST_ID = offer.request_id;

        }

        console.log('optionCode: ');


        let offers = [...this.state.offers];

        let offerIdx = null;

        for (let i in offers){
            if(offers[i].optionCode == optionCode){
                offerIdx = i; 
                break;
            }
        }


        if(offerIdx !== null ){

            if(data.WhatGet){
                $.ajax({
                    url: '/local/ajax/tour-search.php',
                    data:data,
                    cache: false,
                    dataType: 'json',
                    beforeSend: () => {
                        offers[offerIdx].optionStatus = 'loading';

                        this.setState({
                            offers: offers
                        })

                    }
                }).done((data) => {
                    offers[offerIdx].optionStatus = 'loaded';

                    this.setState({
                        offers: offers
                    });

                });
            }



        }

    }



    renderOptionBlock(offer){
        const { optionStatus, options} = offer;
        if(!optionStatus){
            return (
                <div className="show-options"
                     onClick={() => this.getOptions(offer)}
                >
                    <div className="icon-list-tour"></div>
                    <div className="text">Посмотреть состав</div>
                </div>
            );
        }

        /*
        if(optionStatus == 'loading'){
            return (
                <div className="show-options">
                    <div className="icon-list-tour"></div>
                    <div className="text">Загрузка</div>
                </div>
            );
        }*/


        return this.renderOptions(options)
    }

}