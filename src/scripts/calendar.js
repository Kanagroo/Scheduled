var container     = document.querySelector("#calendar-content");
var header_month  = document.querySelector("#calendar-header-month");
var header_year   = document.querySelector("#calendar-header-year");
var arrow_left    = document.querySelector("#calendar-arrow-left");
var arrow_right   = document.querySelector("#calendar-arrow-right")
var months        = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var calendar_data = {"selected":[]};

function dayTileClickHandler(e) {
    let node = e.target;
    if (node.nodeName === "SPAN")
        node = node.parentNode;


    if (node.classList.contains('selected')) {
        node.classList.remove('selected')

        let idx = calendar_data.selected.map(Number).indexOf(
            +new Date(
                node.getAttribute("data-year"),
                node.getAttribute("data-month"),
                node.getAttribute("data-day")
            )
        )
        if (idx != -1)
            calendar_data.selected.splice(
                idx , 1
            );

    } else {
        node.classList.add('selected');
        calendar_data.selected.push(
            new Date(
                node.getAttribute("data-year"),
                node.getAttribute("data-month"),
                node.getAttribute("data-day")
            )
        );
    }
}

function fill_calendar(month_date) {
    var node        = document.createElement("div");
    var blank_node  = document.createElement("div");
    var sub_node    = document.createElement("span");
    var txt_node    = document.createTextNode("1");

    // Clear calendar
    container.innerHTML = '';

    node.classList.add("calendar-day-container");
    blank_node.classList.add("calendar-day-blank");
    node.style.width        = container.offsetWidth/7 + 'px';
    node.style.height       = container.offsetWidth/7 + 'px';
    blank_node.style.width  = container.offsetWidth/7 + 'px';
    blank_node.style.height = container.offsetWidth/7 + 'px';
    
    sub_node.appendChild(txt_node);
    node.appendChild(sub_node);

    let offset = month_date.getDay();
    month_date.setMonth(month_date.getMonth() + 1)
    month_date.setDate(0)
    let month_length = month_date.getDate();

    // First Blank tiles
    for (let i=0; i < offset ; i++) {
        container.appendChild(blank_node.cloneNode(true));
    }

    // Day tiles
    for (let i=1; i <= month_length; i++) {
        txt_node.nodeValue = i;
        let cnode = node.cloneNode(true);
        cnode.onclick = dayTileClickHandler;
        cnode.setAttribute("data-day", i);
        cnode.setAttribute("data-month", month_date.getMonth());
        cnode.setAttribute("data-year", month_date.getFullYear());
        if (calendar_data.selected.map(Number).indexOf(
            +new Date(
                month_date.getFullYear(),
                month_date.getMonth(),
                i)
            ) != -1)
            cnode.classList.add('selected');
        container.appendChild(cnode);
    }

    // Last Blank tiles
    for (let i=0; i < (7*6) - month_length-offset; i++) {
        container.appendChild(blank_node.cloneNode(true));
    }
}

function change_month(delta, date) {
    date.setMonth(date.getMonth() + delta);
    date.setDate(1);
    header_month.textContent = months[date.getMonth()].toUpperCase();
    header_year.textContent = date.getFullYear();
    fill_calendar(new Date(date.getTime()));
}


var month_date = new Date();
month_date.setDate(1);

fill_calendar(month_date);
header_month.textContent = months[month_date.getMonth()].toUpperCase();
header_year.textContent = month_date.getFullYear();
arrow_left.addEventListener('click', () => {change_month(-1, month_date)});
arrow_right.addEventListener('click', () => {change_month(1, month_date)});
