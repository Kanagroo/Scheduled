var addButton = document.getElementById('cycle-content-add');
var phase_template = document.getElementById('cycle-content-template');
var bin_template = document.getElementById('cycle-content-bin-template')
var phase_container = document.getElementById('cycle-body-content');
var bin_container = document.getElementById('cycle-body-content-bins');
var day_arrow_positive = document.getElementById('cycle-body-header-selector-arrow-positive');
var day_arrow_negative = document.getElementById('cycle-body-header-selector-arrow-negative');
var length_arrow_positive = document.getElementById('cycle-header-selector-arrow-positive');
var length_arrow_negative = document.getElementById('cycle-header-selector-arrow-negative');
var length_counter = document.getElementById('cycle-header-selector-value');
var day_counter = document.getElementById('cycle-body-header-tag');

let current_day = 0

var cycle = {
    'days': [[]]
}

var getPhasesAmount = () => {
    let phases = document.getElementsByClassName('cycle-content-object');
    return phases.length;
}

function removePhase(e) {
    if (getPhasesAmount() <= 1)
        return;

    var bins = document.getElementsByClassName('cycle-content-bin');
    var phases = document.getElementsByClassName('cycle-content-object');

    bin_idx = Array.from(bins).indexOf(e);

    phases[bin_idx].remove();
    bins[bin_idx].remove();
    cycle.days[current_day].splice(bin_idx, 1);
    
    if (getPhasesAmount() <= 1)
        bins[0].remove();

    save_data();
}

function addPhase(time='', name='', add_data=true) {
    var phase_node = phase_template.content.cloneNode(true);
    var bin_node = bin_template.content.cloneNode(true);
    phase_node.querySelector('input[type=time]').value = time;
    phase_node.querySelector('input[type=text]').value = name;
    phase_container.insertBefore(phase_node, addButton);
    bin_container.innerHTML = '';
    if (getPhasesAmount() > 1) {
        for (let i=0;i<getPhasesAmount();i++) {
            bin_container.appendChild(bin_node.cloneNode(true));
        }
    }

    if (add_data) {
        cycle.days[current_day].push({'time':'','name':''});
        save_data();
    }
    
}
    

function changeDay(delta) {
    let phases = phase_container.getElementsByClassName('cycle-content-object');
    let bins = bin_container.getElementsByClassName('cycle-content-bin');

    if (current_day + delta < 0 || current_day + delta >= cycle.days.length)
        return;

    Array.from(phases).forEach(e => e.remove());
    Array.from(bins).forEach(e => e.remove());

    current_day += delta;

    if (cycle.days[current_day])
        cycle.days[current_day].forEach(e => addPhase(e.time, e.name, false));

    day_counter.innerText = `Day ${current_day+1}`;
}

function changeLength(delta) {
    if (delta >= 0) {
        for (let i=0;i<delta;i++)
            cycle.days.push([{'time':'','name':''}]);
    } else {
        if (cycle.days.length > 1)
            cycle.days = cycle.days.slice(0, cycle.days.length + delta)
        else return
    }
    length_counter.innerText = cycle.days.length
    save_data();
}

function phaseChangeHandler(e, type) {
    phases = phase_container.getElementsByClassName('cycle-content-object');
    phase_idx = Array.from(phases).indexOf(e.parentElement.parentElement);
    cycle.days[current_day][phase_idx][type] = e.value;
    save_data();
}

var save_data = () => {
    sessionStorage.setItem(
        'step' + sessionStorage.getItem('step'), 
        JSON.stringify({'type':'cycle','data':cycle})
    )
}
var saved_data = sessionStorage.getItem('step' + sessionStorage.getItem('step'))

if (saved_data != null) {
    cycle = JSON.parse(saved_data).data;
    changeDay(0)
    changeLength(0)
} else {
    addPhase();
    save_data();
}


addButton.addEventListener('click', e => {
    addPhase();
});
day_arrow_positive.addEventListener('click', e=>changeDay(1));
day_arrow_negative.addEventListener('click', e=>changeDay(-1));
length_arrow_positive.addEventListener('click', e=>changeLength(1));
length_arrow_negative.addEventListener('click', e=>changeLength(-1));
