export function naturalSort(array, extractor) {
    "use strict";
    // преобразуем исходный массив в массив сплиттеров
    var splitters = array.map(makeSplitter);
    // сортируем сплиттеры
    var sorted = splitters.sort(compareSplitters);
    // возвращаем исходные данные в новом порядке
    return sorted.map(function (splitter) {
        return splitter.item;
    });
    // обёртка конструктора сплиттера
    function makeSplitter(item) {
        return new Splitter(item);
    }
    // конструктор сплиттера
    //    сплиттер разделяет строку на фрагменты "ленивым" способом
    function Splitter(item) {
        var index = 0;           // индекс для прохода по строке
        var from = 0;           // начальный индекс для фрагмента
        var parts = [];         // массив фрагментов
        var completed = false;       // разобрана ли строка полностью
        // исходный объект
        this.item = item;
        // ключ - строка
        var key = (typeof (extractor) === 'function') ?
            extractor(item) :
            item;
        this.key = key;
        // количество найденных фрагментов
        this.count = function () {
            return parts.length;
        };
        // фрагмент по индексу (по возможности из parts[])
        this.part = function (i) {
            while (parts.length <= i && !completed) {
                next();   // разбираем строку дальше
            }
            return (i < parts.length) ? parts[i] : null;
        };
        // разбор строки до следующего фрагмента
        function next() {
            // строка ещё не закончилась
            if (index < key.length) {
                // перебираем символы до границы между нецифровыми символами и цифрами
                while (++index) {
                    var currentIsDigit = isDigit(key.charAt(index - 1));
                    var nextChar = key.charAt(index);
                    var currentIsLast = (index === key.length);
                    // граница - если символ последний,
                    // или если текущий и следующий символы разнотипные (цифра / не цифра)
                    var isBorder = currentIsLast ||
                        xor(currentIsDigit, isDigit(nextChar));
                    if (isBorder) {
                        // формируем фрагмент и добавляем его в parts[]
                        var partStr = key.slice(from, index);
                        parts.push(new Part(partStr, currentIsDigit));
                        from = index;
                        break;
                    } // end if
                } // end while
                // строка уже закончилась
            } else {
                completed = true;
            } // end if
        } // end next
        // конструктор фрагмента
        function Part(text, isNumber) {
            this.isNumber = isNumber;
            this.value = isNumber ? Number(text) : text;
        }
    }
    // сравнение сплиттеров
    function compareSplitters(sp1, sp2) {
        var i = 0;
        do {
            var first = sp1.part(i);
            var second = sp2.part(i);
            // если обе части существуют ...
            if (null !== first && null !== second) {
                // части разных типов (цифры либо нецифровые символы)
                if (xor(first.isNumber, second.isNumber)) {
                    // цифры всегда "меньше"
                    return first.isNumber ? -1 : 1;
                    // части одного типа можно просто сравнить
                } else {
                    var comp = compare(first.value, second.value);
                    if (comp != 0) {
                        return comp;
                    }
                } // end if
                // ... если же одна из строк закончилась - то она "меньше"
            } else {
                return compare(sp1.count(), sp2.count());
            }
        } while (++i);
        // обычное сравнение строк или чисел
        function compare(a, b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        };
    };
    // логическое исключающее "или"
    function xor(a, b) {
        return a ? !b : b;
    };
    // проверка: является ли символ цифрой
    function isDigit(chr) {
        var code = charCode(chr);
        return (code >= charCode('0')) && (code <= charCode('9'));
        function charCode(ch) {
            return ch.charCodeAt(0);
        };
    };
}

export function numberFormat(number, decimals, dec_point, thousands_sep) {	// Format a number with grouped thousands
    //
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +	 bugfix by: Michael White (http://crestidg.com)

    var i, j, kw, kd, km;

    // input sanitation & defaults
    if (isNaN(decimals = Math.abs(decimals))) {
        decimals = 2;
    }
    if (dec_point == undefined) {
        dec_point = ",";
    }
    if (thousands_sep == undefined) {
        thousands_sep = ".";
    }

    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

    if ((j = i.length) > 3) {
        j = j % 3;
    } else {
        j = 0;
    }

    km = (j ? i.substr(0, j) + thousands_sep : "");
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
    //kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
    kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");


    return km + kw + kd;
}


export function initScrollOffers(){
    let pane = $('.hotel-propositions .scroll-content');
    
    pane.jScrollPane({
        autoReinitialise: true
    });
    let api = pane.data('jsp');
    $('.scroll-bottom').bind('click', function () {
        // Note, there is also scrollByX and scrollByY methods if you only
        // want to scroll in one dimension
        api.scrollBy(0, 150);
        return false;
    });
    if ($(window).width() < 761) {
        api.destroy();
    }
}

export function initShowFlyInfo(){
    // show fly info
    var count = 0;
    var tolerance = 500;
    $('body').on("mouseenter", '.hotel-propositions .fly-info', function () {
        count++;
        var num = 0;
        $('body').find('.fly-view:not(.hidden)').each(function () {
            num++;
        });
        var positions = $(this).offset();
        var t = positions.top;
        var l = positions.left;

        var fly_info = $(this).parents('.options').find('.fly-view').clone();

        if (num == 0) {
            fly_info.appendTo('body')
                .removeClass('hidden')
                .css({
                    "position": "absolute",
                    "z-index": 100,
                    "top": t,
                    "left": l + $(this).width()
                });
        }


        fly_info.bind("mouseleave", function () {
            count--;
            setTimeout(function () {
                if (!count) {
                    $('.fly-view').not('.hidden').fadeOut(300).remove();
                }
            }, tolerance);

        });

    });
}