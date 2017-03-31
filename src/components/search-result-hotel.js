import React, {Component} from 'react';
import {
    initDateSlick,
    initTypeSlick
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
            curDate: this.curDate,
            arXHR: [],
            SEARCH: {},
            isLLCompleted: !!this.LL_API_IN,
            isNtkCompleted: Object.keys(this.NTK_PACk_TYPES).length * -1,
        }
    }

    componentDidMount() {
        this.getNTKHotelOffers();
        initDateSlick();
        initTypeSlick();
    }

    componentDidUpdate() {

    	console.log('componentDidUpdate');
        initDateSlick();
        initTypeSlick();


    }

    getNTKHotelOffers() {

        if (this.NTK_API_IN.Destination) {
            this.setState({isSearchWasStarted: true});

            this.NTK_PACk_TYPES.forEach((pack) => {
                const NTK_API_IN = {...this.NTK_API_IN, ...pack};

				let xhr = $.ajax({
					url: this.ajaxUrl,
					data: {
						getHotelOffers: 'Y',
						NTK_API_IN: NTK_API_IN,
						origUrl: document.location.href
					},
					dataType: 'html',
					cache: false,
				}).done(data => {

					console.log('data: ', data);

				});

				this.arXHRsPush(xhr);
            });
        }
    }



    render() {

        return (
            <div className="row hotel-propositions">
                <h2 className="title-hotel">Предложения по отелю</h2>
                <div className="flex">
							<span className="-col-4 -date">
								<div className="wrapper">
									<div className="title">Дата заезда:</div>
									<div className="options">
										<div className="options-item">
											<span className="date">04 января</span>
											<span className="week">четверг</span>
										</div>
										<div className="options-item">
											<span className="date">05 января</span>
											<span className="week">пятница</span>
										</div>
										<div className="options-item">
											<span className="date">06 января</span>
											<span className="week">суббота</span>
										</div>
										<div className="options-item">
											<span className="date">07 января</span>
											<span className="week">воскресенье</span>
										</div>
										<div className="options-item">
											<span className="date">08 января</span>
											<span className="week">понедельник</span>
										</div>
										<div className="options-item">
											<span className="date">09 января</span>
											<span className="week">вторник</span>
										</div>
										<div className="options-item">
											<span className="date">10 января</span>
											<span className="week">среда</span>
										</div>
										<div className="options-item">
											<span className="date">11 января</span>
											<span className="week">четверг</span>
										</div>
										<div className="options-item">
											<span className="date">12 января</span>
											<span className="week">пятница</span>
										</div>
										<div className="options-item">
											<span className="date">13 января</span>
											<span className="week">суббота</span>
										</div>
										<div className="options-item">
											<span className="date">14 января</span>
											<span className="week">воскресенье</span>
										</div>
										<div className="options-item">
											<span className="date">15 января</span>
											<span className="week">понедельник</span>
										</div>
										<div className="options-item">
											<span className="date">16 января</span>
											<span className="week">вторник</span>
										</div>
										<div className="options-item">
											<span className="date">17 января</span>
											<span className="week">среда</span>
										</div>
									</div>
								</div>
							</span>
                    <span className="-col-4 -type">
								<div className="wrapper">
									<div className="title">Выберите тип тура:</div>
									<div className="options">
										<div className="options-item">
											<span className="type">Проживание + авиаперелет</span>
											<span className="option">от <strong>230 000 <span
                                                className="rub">Р</span></strong></span>
										</div>
										<div className="options-item">
											<span className="type">Только проживание</span>
											<span className="option">от <strong>120 000 <span
                                                className="rub">Р</span></strong></span>
										</div>
										<div className="options-item">
											<span className="type">Ж/Д туры</span>
											<span className="option">(выберите в фильтре поиска)</span>
										</div>
										<div className="options-item">
											<span className="type">Автобусные туры</span>
											<span className="option">(выберите в фильтре поиска)</span>
										</div>
										<div className="options-item">
											<span className="type">Проживание + авиаперелет</span>
											<span className="option">от <strong>230 000 <span
                                                className="rub">Р</span></strong></span>
										</div>
										<div className="options-item">
											<span className="type">Только проживание</span>
											<span className="option">от <strong>120 000 <span
                                                className="rub">Р</span></strong></span>
										</div>
										<div className="options-item">
											<span className="type">Ж/Д туры</span>
											<span className="option">(выберите в фильтре поиска)</span>
										</div>
										<div className="options-item">
											<span className="type">Автобусные туры</span>
											<span className="option">(выберите в фильтре поиска)</span>
										</div>
									</div>
								</div>
							</span>
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
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">180 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>
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
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">10 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Страховка</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">0 000 <span className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>

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

																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">180 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>

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

																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Страховка</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">180 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>

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

																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Страховка</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">180 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>

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

																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Страховка</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">180 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>

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

																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Страховка</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">180 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>

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

																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Страховка</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">180 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>

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

																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Страховка</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>
										<div className="hotel-item">
											<div className="tab-wrapper -proposition">
												<div className="-middle">
													<span className="room">
														<strong>Стандартный номер</strong>
														2-местный 2-комнатный люкс корпус 2, возле моря
													</span>
													<span className="type">
														<div className="label show-mobile">Тип тура</div>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
														<span className="icon-one-people"></span>
													</span>
													<span className="eat"><div
                                                        className="label show-mobile">Питание</div>All</span>
													<span className="consist">
														<div className="-wrapper">
															<div className="buy">
																<span className="buy-wrapper">
																	купить
																	<span className="price">180 000 <span
                                                                        className="rub">Р</span></span>
																</span>
															</div>
															<div className="show-options">
																<div className="icon-list-tour"></div>
																<div className="text">Посмотреть состав</div>
															</div>
															<div className="options">
																<div className="label show-mobile">Состав тура</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span><div
                                                                    className="fly-info">Пререлёт</div></div>

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

																<div className="option positive"><span
                                                                    className="icon-ok"></span>Проживание</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Страховка</div>
																<div className="option positive"><span
                                                                    className="icon-ok"></span>Трансфер</div>
																<div className="option negative"><span
                                                                    className="icon-cross"></span>Топливный сбор <span
                                                                    className="nowrap">4 500<span
                                                                    className="rub">Р</span></span></div>
															</div>
															<div className="logo"></div>
														</div>
													</span>
												</div>
											</div>
										</div>

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

}