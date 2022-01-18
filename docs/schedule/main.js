const header = document.getElementById('header');
const header_container = document.getElementById('header-wrapper');
const cards_container = document.getElementById('cards-wrapper');
const card_template = document.getElementById('card-template');
const arrow_left = document.getElementById('arrow-left');
const arrow_right = document.getElementById('arrow-right');

function romanize(num) {
    var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,
         L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},roman = '',i;
    for ( i in lookup ) {
      while ( num >= lookup[i] ) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
}

function detect_colormode() {
    let theme = 'light';
    let saved_theme = localStorage.getItem('theme')
    if (saved_theme)
        theme = saved_theme;

    if (window.matchMedia)
        if (window.matchMedia("(prefers-color-scheme: dark)").matches)
            theme = 'dark';
    
    document.documentElement.setAttribute('data-theme', theme);
}

function decode_data(data) {
    const segments = data.split('.')
    start_date = new Date(segments[0]);
    end_date = new Date(segments[1]);

    breaks = [];
    offset = 1;
    if (segments[2][1] == '~') {
        breaks.push(
            new Date(
                new Date(start_date)
                    .setDate(start_date
                        .getDate() + (segments[2][0].charCodeAt() - 33) 
                                   + (segments[2][2].charCodeAt() - 33)*89)
            )
        );
        offset = 3;
    } else {
        breaks.push(
            new Date(
                new Date(start_date)
                    .setDate(start_date
                        .getDate() + segments[2][0].charCodeAt() - 33)
            )
        );
    }

    
    for (let i=offset;i<segments[2].length;i++) {
        let c = segments[2][i]
        let nc = segments[2][i+1]
        let nnc = segments[2][i+2]
        if (nc == '~') {
            breaks.push(
                new Date(
                    new Date(
                        breaks[breaks.length-1]
                    ).setDate(breaks[breaks.length-1]
                        .getDate() + (c.charCodeAt() - 33) * (ncc.charCodeAt() - 33)
                    )
                )
            );
            i += 2;
        } else {
            breaks.push(
                new Date(
                    new Date(
                        breaks[breaks.length-1]
                    ).setDate(breaks[breaks.length-1]
                        .getDate() + c.charCodeAt() - 33)
                )
            );
        }
    }

    let cycle = {'days':[]};
    
    cycle.days = segments[3]
        .split('-')
        .map(e => e.split(')'))
        .map(e => e.map(r => r.split('('))
            .map(e => {return {'name':e[0],'time':e[1]}})
        );

    result = {'sd': start_date, 'ed': end_date, 'breaks': breaks, 'cycle': cycle};
    return result;
}

function find_cycle_day(data, date) {
    cur_date = new Date(data.sd);
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (data.breaks.map(e=>e.getTime()).includes(date.getTime()) || date.getDay() == 0 || date.getDay() == 6)
        return -1;
    
    let cur_day = 0;
    i=0
    while (cur_date.getTime() != date.getTime()) {
        if (!data.breaks.map(e=>e.getTime()).includes(cur_date.getTime()) && (cur_date.getDay() != 0 && cur_date.getDay() != 6)) {
            cur_day = (cur_day + 1) % data.cycle.days.length;
        }
        cur_date = new Date(data.sd);
        i++;
        cur_date.setDate(cur_date.getDate() + i);

    }
    return cur_day;
}

function create_card(title, time) {
    card = card_template.content.cloneNode(true);
    card.querySelector('.card-title').textContent = title;
    card.querySelector('.card-n').textContent = romanize(cards_container.children.length + 1);
    card.firstElementChild.setAttribute('data-time', time)

    cards_container.appendChild(card);
}

function changeDay(delta, cur_date, data) {
    date = new Date(cur_date.getTime());
    date.setDate(cur_date.getDate() + delta);
    if (date > data.ed || date < data.sd)
        return;
    cur_date.setTime(date.getTime());
    updateHeader(cur_date, data);
    updateCards(cur_date, data);
    updateUI(new Date(), cur_date);
}

function updateHeader(date, data) {
    /* Header text */
    var header_content = [
        date.toLocaleString('default', { month: 'long' })+', '+date.getDate(),
        date.toLocaleString('default', { weekday: 'long' }),
        find_cycle_day(data, date) != -1 ? 'Day ' + (find_cycle_day(data, date) + 1) : 'Break'
    ];
    Array.from(header_container.children)
            .forEach((e, i) => e.firstChild.textContent = header_content[i]);
}

function updateCards(date, data) {
    /* Remove cards */
    if (cards_container.children.length > 0)
        Array.from(cards_container.children).forEach(e => e.remove());

    /* Add cards */
    if (find_cycle_day(data, current_date) == -1)
        return;
    data.cycle.days[find_cycle_day(data, date)]
            .forEach((e,i,a) => 
                create_card(
                    e.name, `${e.time}-${a.length-1>i ? a[i+1].time : '24:00' }`
                )
            );
}

function updateUI(date, selected_date) {
    if (cards_container.children.length < 1)
        return;
    Array.from(cards_container.children).forEach((e, i) => {
        let [st, et] = e.dataset.time.split('-');
        let sd = new Date(
            selected_date.getFullYear(), selected_date.getMonth(),
            selected_date.getDate(), st.split(':')[0],
            st.split(':')[1]
        )
        let ed = new Date(
            selected_date.getFullYear(), selected_date.getMonth(),
            selected_date.getDate(), et.split(':')[0],
            et.split(':')[1]
        )

        if (sd <= date && ed > date)
            e.classList.add('active');
        else if (e.classList.contains('active'))
            e.classList.remove('active')
    });
}

/* Data from url */
var url = new URL(window.location.href);
var data = url.searchParams.get('d');
if (!data)
    window.location = '../'
try {
    data = decode_data(atob(data));
} catch (error) {
    console.log(error)
    window.location = '../'
}

var current_date = new Date()

/* Color mode */
detect_colormode();

/* Update UI */
updateHeader(current_date, data);
updateCards(current_date, data);
updateUI(new Date(), current_date);

/*Event Listeners */
header.addEventListener('click', e => {
    header.classList.contains('extended') ? 
        header.classList.remove('extended') : header.classList.add('extended')})
arrow_left.addEventListener('click', changeDay.bind(null, -1, current_date, data));
arrow_right.addEventListener('click', changeDay.bind(null, +1, current_date, data));


/* UI Update Loop */
setInterval(updateUI.bind(null, new Date(), current_date), 1000);

// ?d=MjAyMS8xMi8xLjIwMjEvMTIvMzEuIyQuYSgwMjowMCliKDAzOjAwLWEoMDI6MDApYigwMzowMA%3D%3D
