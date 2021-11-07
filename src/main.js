const content_body = document.querySelector('#body');
const header = document.querySelector('#header-sub');
const continue_button = document.querySelector('#footer-button-continue');
const steps = [
    {
        'header': 'Set a Start and an End',
        'location': 'scenes/calendar',
        'dependencies': [
            {'tag': 'link', 'properties':{'rel': 'stylesheet', 'href': 'styles/calendar.css'}},
            {'tag': 'script', 'properties':{'src': 'scripts/calendar.js', 'type':'text/javascript'}}
                     ]
    },
    {
        'header': 'Plan your cycle',
        'location': 'scenes/cycle',
        'dependencies': [
            {'tag': 'link', 'properties':{'rel': 'stylesheet', 'href': 'styles/cycle.css'}},
            {'tag': 'script', 'properties':{'src': 'scripts/cycle.js', 'type':'text/javascript'}}
        ]
    }
];

let step = 0;

async function animation(step_element, isEnter) {
    if (!step_element)
        return;
    
    const animation_time = 1000
    

    // Initial Styles
    step_element.style.transition = `0ms transform ease-in-out, 0ms opacity ease-in-out`;
    step_element.style.transform = `translateX(${isEnter ? window.innerWidth/2 + step_element.offsetWidth/2 : 0}px)`
    step_element.style.opacity = isEnter ? 0 : 100;
    header.style.transform = `translateY(${isEnter ? -header.offsetHeight : 0}px)`
    

    step_element.style.transition = `${animation_time}ms transform ease-in-out, ${animation_time}ms opacity ease-in-out`;
    header.style.transition = `${animation_time}ms transform ease-in-out`;

    // Post Styles
    step_element.style.transform = `translateX(${isEnter ? 0 : -(window.innerWidth/2 + step_element.offsetWidth/2)}px)`
    step_element.style.opacity = isEnter ? 100 : 0;
    header.style.transform = `translateY(${isEnter ? 0 : -header.offsetHeight}px)`

    // Wait until transition finish
    await new Promise((r) => setTimeout(r, animation_time));

    step_element.style = null;
}

async function load_step(step) {
    // Change header
    header.textContent = step.header;
    // Clear Body
    content_body.innerHTML = '';

    //Create 'step' container
    var container = document.createElement('div');
    container.className = 'step';
    container.style.transform = `translateX(${window.innerWidth/2 + container.offsetWidth/2}px)`
    container.style.opacity = 0;


    // Load Step HTML
    var step_html_content = await (await fetch(step.location + '.html')).text();
    container.innerHTML = step_html_content;

    // Load Step Depedendies
    if (step.dependencies) {
        step.dependencies.forEach(dependency => {
            var node = document.createElement(dependency.tag);
            for (var property in dependency.properties) {
                node[property] = dependency.properties[property];
            }
            container.appendChild(node);
        });
    }

    content_body.appendChild(container);

    await animation(container, true);
}

async function unload_step() {
    const container = document.querySelector('.step');

    await animation(container, false)
    container.remove();
    
}

function nextStepHandler(e) {

}

// async function step_animation(type) {
//     const container = document.querySelector('.step');
//     if (!container)
//         return;
//     let animation_steps = 100;
//     let animation_speed = 2;
//     const step_animation = async (completion) => {
//         if (type==='exit')
//         container.style.transform = `translateX(calc(-${completion / 2 * (100/animation_steps)}vw - ${container.offsetWidth/(100/(completion/2 * (100/animation_steps)))}px ))`;
//         if (type==='enter')
//         container.style.transform = `translateX(calc(-${completion / 2 * (100/animation_steps)}vw - ${container.offsetWidth/(100/(completion/2 * (100/animation_steps)))}px + 50vw + ${container.offsetWidth/2}px))`;
//         await new Promise(r => setTimeout(r, animation_speed));

//         animation_speed = Math.pow(animation_speed, 1.02);
//     }

//     for (let i=1; i<=animation_steps; i++)
//         await step_animation(i);
// }




load_step(steps[step]);

continue_button.addEventListener(
    'click', nextStepHandler
);


// setTimeout(unload_step, 2000);

// new Promise((r) => setTimeout(r, 4000)).then(() => {
//     load_step(steps[step])
// });
