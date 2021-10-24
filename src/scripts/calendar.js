var container     = document.querySelector("#calendar-content");
var header_month  = document.querySelector("#calendar-header-month");
var header_year   = document.querySelector("#calendar-header-year");
var arrow_left    = document.querySelector("#calendar-arrow-left");
var arrow_right   = document.querySelector("#calendar-arrow-right")
var months        = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function fill_calendar(month_date) {
    const template  = "<div class=\"calendar-day-container\"><span>#</span></div>";
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
        container.appendChild(node.cloneNode(true));
    }

    // Last Blank tiles
    for (let i=0; i < (7*6) - month_length-offset; i++) {
        container.appendChild(blank_node.cloneNode(true));
    }
}

function change_month(delta, date) {
    date.setMonth(date.getMonth() + delta);

    header_month.textContent = months[date.getMonth()].toUpperCase();
    header_year.textContent = date.getFullYear();
    fill_calendar(new Date(date.getTime()));
}


var month_date = new Date();
month_date.setDate(1);

fill_calendar(month_date);
arrow_left.addEventListener('click', () => {change_month(-1, month_date)});
arrow_right.addEventListener('click', () => {change_month(1, month_date)});
