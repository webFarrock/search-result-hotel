import React, {Component} from 'react';
import moment from 'moment';
import Loader from './loader';
import {
    initScrollOffers,
    initSlicks,
    numberFormat,
    initDatesSlick,
    initTypesSlick
} from '../tools/tools';
import {Scrollbars} from 'react-custom-scrollbars';


export default class SearchResultHotel extends Component {

    constructor(props) {

        super(props);

        window.reactApp = this;


        this.curDate = window.RuInturistStore.initForm.dateFrom
        this.NTK_PACk_TYPES = window.RuInturistStore.NTK_PACk_TYPES;
        this.NTK_API_IN = window.RuInturistStore.NTK_API_IN;
        this.LL_API_IN = window.RuInturistStore.LL_API_IN;
        this.USER_FAV = window.RuInturistStore.USER_FAV;
        this.ajaxUrl = '/tour-search/ajax.php';

        if (this.NTK_API_IN) {
            this.adultsAmount = this.NTK_API_IN.Adults;
            this.childAmount = this.NTK_API_IN.Childs;
        } else if (this.LL_API_IN) {
            this.adultsAmount = this.LL_API_IN.adults;
            this.childAmount = this.LL_API_IN.kids;
        }

        this.LLMaxChkNum = 10; // максимальное количество запросов к ЛЛ
        this.LLChkTimeOut = 4 * 1000; // интервал проверки результатов ЛТ
        this.LLCompletedRequests = {};

        this.arXHRs = [];

        if (!this.NTK_PACk_TYPES[0]) this.NTK_PACk_TYPES[0] = {};
        if (!this.NTK_PACk_TYPES[1]) this.NTK_PACk_TYPES[1] = {};

        this.state = {
            offersNTK: [],
            offersLL: [],
            arXHR: [],
            chkLTResNum: 0,
            isLLCompleted: this.LL_API_IN ? false : true,
            isNtkCompleted: Object.keys(this.NTK_PACk_TYPES).length * -1,
            dates: this.initDatesList(),
            //packs: [],
            packs: this.NTK_PACk_TYPES,
            offers: [],
            isSlickInit: ($(window).width() < 1900) ? true : false,

            datePackMinPrice: {},
            selectedDate: this.curDate,
            selectedPack: this.NTK_PACk_TYPES[0].id || this.NTK_PACk_TYPES[1].id,
            isSearchWasStarted: false,
            isMobile: ($(window).width() <= 768) ? true : false,
        }


        this.onScrollButtonClick = this.onScrollButtonClick.bind(this);
    }


    initDatesList() {
        moment.lang('ru');
        let dateFrom = window.RuInturistStore.initForm.dateFrom;
        if (!dateFrom) return {};

        let momentDate = moment(dateFrom, 'DD.MM.YYYY').add(-4, 'day');

        let dates = {};


        for (let i = 0; i <= 6; i++) {

            let date2add = momentDate.add(1, 'day');
            const origFormatted = date2add.format('DD.MM.YYYY');

            dates[origFormatted] = {
                ts: +date2add.format('X'),
                origFormatted: origFormatted,
                dayOfWeek: date2add.format('dddd'),
                dayAndMonth: date2add.format('D MMMM'),
            };
        }

        return dates;
    }

    renderRoomType() {
        let roomType = [];
        if (this.adultsAmount) {
            for (let i = 0; i < this.adultsAmount; i++) {
                roomType.push(<span key={"adult" + i} className="icon-one-people"></span>);
            }
        }

        if (this.childAmount) {
            for (let i = 0; i < this.childAmount; i++) {
                roomType.push(<span key={"child" + i} className="icon-one-people-small"></span>);
            }
        }

        return roomType;
    }

    componentDidMount() {
        this.getNTKHotelOffers();
        this.getLLHotelOffers();

        $(window).on('resize', () => {
            //initScrollOffers();
            this.setState({
                isSlickInit: ($(window).width() < 1919) ? true : false,
            });
        });

        $(window).on('resize', () => {
            let isMobile = ($(window).width() <= 768) ? true : false;

            this.setState({
                isMobile: isMobile,
            });

        });

    }

    componentDidUpdate() {

        //initScrollOffers();

        if(this.state.isSlickInit){
            initDatesSlick(this);
        }

        initTypesSlick(this);
    }

    resultsHandler(source, isLastRequest) {
        moment.lang('ru');

        let offers = [...this.state.offersNTK, ...this.state.offersLL]

        let datePackMinPrice = Object.assign({}, ...this.state.datePackMinPrice);

        // dates
        let dates = Object.assign({}, ...this.state.dates);

        offers.forEach((offer, i, arr) => {

            if ('NTK' === offer.source) {
                arr[i].optionCode = offer.source + offer.PriceKey;
            } else if ('LL' === offer.source) {
                arr[i].optionCode = offer.source + offer.tour_id;
            }


            const {TourDate} = offer;

            if (!TourDate) return;

            const datePackMinPriceId = `${TourDate}_${arr[i].packId}`;
            if (!datePackMinPrice[datePackMinPriceId]) {
                datePackMinPrice[datePackMinPriceId] = offer.Price;
            } else if (datePackMinPrice[datePackMinPriceId] > offer.Price) {
                datePackMinPrice[datePackMinPriceId] = offer.Price;
            }
        });


        offers.sort((i, j) => i.Price - j.Price);

        let isNtkCompleted = this.state.isNtkCompleted;


        if (source === 'NTK') {
            isNtkCompleted++;
        }

        
        this.setState({
            offers: offers,
            datePackMinPrice,
            isNtkCompleted,
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

                        data.forEach((item, idx) => {
                            data[idx].packId = pack.id;
                        });

                        this.setState({
                            offersNTK: [...this.state.offersNTK, ...data],
                        });

                        this.resultsHandler('NTK');
                    } else {
                        this.setState({
                            isNtkCompleted: this.state.isNtkCompleted + 1,
                        });

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


        if (!(this.state.offersLL.length + this.state.offersNTK.length) || !packs.length || !Object.keys(dates).length) {
            return (
                <div className="row hotel-propositions">
                    <h2 className="title-hotel">Предложения по отелю</h2>

                    {(isSearchWasStarted && !(isLLCompleted && isNtkCompleted >= 0)) ?
                        <div className="flex loader-wp"><Loader /></div>
                        : ''}
                    {(!(this.state.offersLL.length + this.state.offersNTK.length) && isSearchWasStarted && isLLCompleted && isNtkCompleted >= 0) ?
                        <h2 className="title-hotel">
                            Пожалуйста, обновите страницу (F5 или cmd+r) - отель популярный и на него приходит слишком
                            много запросов.
                            <br/>
                            <a href="" style={{color: '#5c85a8', textDecoration: 'underline'}}>Обновить</a>
                        </h2>
                        : ''}
                </div>
            );
        }


        packs = packs.sort((i, j) => i.id == 1 ? -1 : 2);

        // prepare min price
        packs = this.preparePacksMinPrice(offers, packs);

        if (packs.length == 1) {
            selectedPack = packs[0].id;
        }

        offers = offers.filter(offer => offer.TourDateDDMMYYYY == selectedDate && +selectedPack == +offer.packId);
        
        return (
            <div className="row hotel-propositions">
                <h2 className="title-hotel">Предложения по отелю</h2>
                <div className="flex">
					<span className="-col-4 -date">
						<div className="wrapper">
							<div className="title">Дата заезда:</div>
                            {this.renderDates({dates, selectedDate})}
						</div>
					</span>
                    <span className="-col-4 -type">
                        <div className="wrapper">
                            <div className="title">Выберите тип тура:</div>
                            <div className="options">
                                {this.renderTypes({packs, selectedPack})}
                            </div>
                        </div>
                    </span>
                    {this.renderOffers(offers)}

                </div>
            </div>
        );

    }

    renderDates(props) {

        let {dates, selectedDate} = props;

        dates = Object.values(dates);

        return (
            <div className="options">
                {dates.map(date => {
                    const {origFormatted, ts, dayOfWeek, dayAndMonth} = date;
                    let cls = 'options-item';

                    if(!this.state.isSlickInit && (this.state.selectedDate == date.origFormatted)){
                        cls += ' slick-current ';
                    }
                    return (
                        <div data-tourdate={origFormatted}
                             key={ts}
                             className={cls}
                             onClick={() => this.setDate(origFormatted)}
                        >
                            <input type="hidden" className="input_cur_date" value={origFormatted}/>
                            <div className="options-item-inner">
                                <span className="date">{dayAndMonth}</span>
                                <span className="week">{dayOfWeek}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        )

    }

    renderTypes(props) {

        let {packs, selectedPack} = props

        return (

            packs.map((pack, idx) => {

                const {id, value_ext, minPricePrint} = pack;
                return (
                    <div key={idx}
                         className="options-item"
                         onClick={() => this.setPack(id)}
                    >
                        <input type="hidden" className="input_cur_date" value={id}/>
                        <div className="options-item-inner">
                            <span className="type">{value_ext}</span>
                            {minPricePrint ?
                                <span className="option">от {minPricePrint} <span className="rub">₽</span></span>
                                : <span className="option">Нет предложений</span>}
                        </div>
                    </div>
                );
            })
        )
    }


    renderOptions(options, packId) {

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

        if (isErrorLoading) {
            return (
                <div className="options">Ошибка при загрузке</div>
            );
        }

        return (
            <div className="options">
                <div className="label show-mobile">Состав тура</div>

                {isFlight && packId === 1 ?
                    <div>
                        <div className="option positive">
                            <span className="icon-ok"></span>
                            <div className="fly-info">
                                Пререлёт
                                {this.renderFilghtDetails(flightDetails, source)}
                            </div>
                        </div>
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
                        <span className="nowrap"> {fuelChargeValue} <span className="rub">₽</span></span>
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
        this.setState({chkLTResNum: 777, isLLCompleted: true});
    }

    idLLFinished() {
        //re
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
                        {this.state.isMobile ? this.renderOffersMap(offers) :
                            <Scrollbars
                                ref="scrollbars"
                                autoHeight
                                autoHeightMin={600}
                            >
                                {this.renderOffersMap(offers)}
                            </Scrollbars>
                        }
                    </div>
                    <div className="scroll-bottom" onClick={this.onScrollButtonClick}>
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

    onScrollButtonClick(){
        const {scrollbars} = this.refs;
        if(scrollbars) {
            scrollbars.scrollTop(scrollbars.getScrollTop() + 155);
        }
    }

    renderOffersMap(offers){
        return offers.map((offer, idx) => {

            let hotelItemCls = ' hotel-item ';
            if(offer.source === 'NTK'){
                hotelItemCls += ' hotel-item__source-ntk ';
            }else{
                hotelItemCls += ' hotel-item__source-ll ';
            }

            return (
                <div key={idx} className={hotelItemCls}>
                    <div className="tab-wrapper -proposition">
                        <div className="-middle">
                                                <span className="room">
                                                    <strong>{offer.RoomType}</strong>
                                                </span>
                            <span className="type">
                                                    <div className="label show-mobile">Тип тура</div>
                                {this.renderRoomType()}
                                                </span>
                            <span className="eat">
                                                    <div className="label show-mobile">Питание</div>
                                {offer.Board} {this.getBoardLabel(offer.Board)}
                                                </span>
                            <span className="consist">
                                                    <div className="-wrapper">
                                                        <div className="buy" onClick={() => {
                                                            if (offer.source === 'NTK') {
                                                                document.location.href = offer.BUY_PAGE_LINK;
                                                            } else {
                                                                document.location.href = '/application_office/' + document.location.search + '&request_id=' + offer.request_id + '&tour_id=' + offer.tour_id;
                                                            }

                                                        }}>
                                                            <span className="buy-wrapper">
                                                                {offer.source === 'NTK' ? 'купить' : 'забронировать'}
                                                                <span className="price">{offer.pricePrint} <span
                                                                    className="rub">₽</span> </span>
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
        })
    }


    getLLHotelOffers() {

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

                if (!data) {

                    this.setLLAsFinished();
                } else {

                    if (data.success) {
                        this.processLTHotelListResult(data);
                    } else {

                        this.setLLAsFinished();
                    }
                }

                //this.setState({isLLCompleted: true});
            });

            this.arXHRsPush(xhr);

        }
    }

    processLTHotelListResult(data) {

        let hasPreparingReq = this.hasPreparingRequests(data.status);
        let hasCompletedReq = this.hasCompletedRequests(data.status);

        if (hasCompletedReq) {
            this.getLTCompletedRequests(data.request_id, !hasPreparingReq);
        }

        if (hasPreparingReq) {

            this.setState({
                chkLTResNum: this.state.chkLTResNum + 1
            });


            if (this.state.chkLTResNum < this.LLMaxChkNum) {
                setTimeout(() => {
                    this.chkLTResultStatus(data.request_id);
                }, this.LLChkTimeOut);
            }
        }

        if (!hasCompletedReq && !hasPreparingReq) {
            this.setLLAsFinished();
        }
    }

    chkLTResultStatus(request_id) {

        var xhr = $.ajax({
            url: '/local/include/ajax/chk-lt-result.php',
            data: {request_id: request_id},
            dataType: 'json',
            cache: false,
        }).done((data) => {
            data.request_id = request_id;
            this.processLTHotelListResult(data);
        });

        this.arXHRsPush(xhr);
    }


    getOptions(offer) {
        let optionCode = null;
        let data = {};

        if ('NTK' === offer.source) {

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
                        isFlight: true,
                        isMed: false,
                        isTransfer: false,
                        isfuelCharge: false,
                        fuelChargeValue: null,
                        flightDetails: null,

                    };


                    if (data.WhatGet === 'getTourDetailLL') {
                        options.source = 'LL';

                        if (res instanceof Object && res.success) {
                            if (res.medical_insurance) {
                                options.isMed = true;
                            }

                            if (res.transfer) {
                                options.isTransfer = true;
                            }

                            if (res.flights instanceof Array && res.flights.length > 0) {
                                //options.isFlight = true;
                                options.isfuelCharge = !!res.flights[0].fuel_charge;
                                options.flightDetails = res.flights[0];

                                if (options.isfuelCharge) {
                                    options.fuelChargeValue = numberFormat(res.flights[0].fuel_charge, 0, '', ' ');
                                }
                            }
                        } else {
                            options.isErrorLoading = true;
                        }

                    } else if (data.WhatGet === 'getTourDetailNTK') {

                        if (res instanceof Object) {
                            options.source = 'NTK';
                            options = Object.assign({}, options, res)
                        } else {
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
        const {optionStatus, options, packId} = offer;

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


        return this.renderOptions(options, packId)
    }


    renderFilghtDetails(flightDetails, source) {

        if (source === 'LL') {

            if (!flightDetails || !flightDetails.back || !flightDetails.to) {
                return (
                    <div className="fly-view hidden">
                        <div className="fly-view--inner">
                            Приносим извинения, данные о перелете загрузились некорректно. Попробуйте перезагрузить
                            данную страничку (F5 или cmd+R) или связаться с нашими менеджерами по телефону
                            + 7&nbsp;(495)&nbsp;730-19-80.
                        </div>
                    </div>
                );
            }

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

        if (source == 'NTK') {

            // заглушка до момента доработки API
            return (
                <div className="fly-view hidden">
                    <div className="fly-view--inner">
                        {/*Информацию о перелетах просим уточнить у наших менеджеров по телефону +7(495) 730-19-80*/}
                        Для просмотра информации по авиаперелетам нажмите "Купить"
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


    hasPreparingRequests(obStatus) {
        for (var i in obStatus) {
            if ('pending' == obStatus[i] || 'performing' == obStatus[i]) return true;
        }
        return false;
    }

    hasCompletedRequests(obStatus) {

        let flag = false;

        for (let key in obStatus) {

            if (
                ('completed' == obStatus[key] || 'cached' == obStatus[key]) && !this.LLCompletedRequests[key]
            ) {
                flag = true;
                this.LLCompletedRequests[key] = true;
            }
        }

        return flag;
    }


    getLTCompletedRequests(request_id, isLastRequest) {

        var xhr = $.ajax({
            url: '/tour-search/ajax.php',
            data: {
                LL_API_IN: this.LL_API_IN,
                ajax: 'Y',
                getHotelOffers: 'Y',
                request_id: request_id,
            },
            dataType: 'json',
            cache: false,

        }).done((data) => {

            if (data && data.success) {



                const pack = this.NTK_PACk_TYPES.filter(i => i.id === 1)[0];

                data.offers.forEach((item, idx) => {
                    data.offers[idx].packId = pack.id;
                });

                this.setState({
                    offersLL: [...data.offers],
                });

                this.resultsHandler('LL', isLastRequest);

            }

        });

        this.arXHRsPush(xhr);
    }


    getBoardLabel(boardCode) {

        for (let key in window.RuInturistStore.FEED_TYPES) {
            if (window.RuInturistStore.FEED_TYPES[key].indexOf(boardCode) !== -1) {
                return '(' + key + ')';
            }
        }

        return '';
    }

}