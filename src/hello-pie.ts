////////////////////////////////////////////////////////////////////////
// Hello Pie


////////////////////////////////////////////////////////////////////////
// Imports


/// <reference lib="dom" />


import * as Pie from './Pie.ts';


////////////////////////////////////////////////////////////////////////
// Class HelloPie


class HelloPie {


    pie: Pie.Pie | null = null;
    tracker: Pie.Tracker | null = null;
    listenerId: number | null = null;


    data: any = {
        title: 'Hello Pie',
        description: 'This is a pie menu.',
        initialDirection: 90,
        clockwise: true,
        slices: [
            {
                items: [
                    {
                        title: 'North',
                    },
                ],
            },
            {
                items: [
                    {
                        title: 'East',
                    },
                ],
            },
            {
                items: [
                    {
                        title: 'South',
                    },
                ],
            },
            {
                items: [
                    {
                        title: 'West',
                    },
                ],
            },

        ],
    };


    constructor(target: any) {

        this.pie = new Pie.Pie();
        this.pie.loadFromJSON(this.data);

        this.tracker = new Pie.Tracker();
        this.tracker.pie = this.pie;

        this.listenerId =
            this.tracker.addListener(
                target,
                'mousedown',
                null);

    }


}


////////////////////////////////////////////////////////////////////////


window.addEventListener('load', () => {
    const target = document.getElementById('target');
    const helloPie = new HelloPie(target);
    console.log('helloPie:', helloPie);
});


////////////////////////////////////////////////////////////////////////
