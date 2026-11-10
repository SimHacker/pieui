////////////////////////////////////////////////////////////////////////
// Pie.ts
// By Don Hopkins.


////////////////////////////////////////////////////////////////////////
// Notes:
//
// Rename properties and methods to not be so mouse-centric.
//     MouseButton => Pressed
//     MousePosition => Position
//
// Multiple buttons.
//
// Multi-touch.
//
// Keyboard navigation.
//
// Canvas background, overlay.
//
// DOM overlays for pies, slices, items, and cursor.
//
// Opening, closing, tracking, and selecting animations.
//
// Send low level PressedDownUI and PressedUpUI events so the
// client has a chance to inhibit pie menu tracking until after the
// next mouse button up event, by setting isPointerOverUIObject = true.
//
// Hover and Drift notification over pies, slices, and items.
// Continuous tracking notification even if the mouse doesn't move.
//
// Plugin slice tracking and drawing for different slices types:
// PullOut, DropDown, DropOut, PieOut, etc.
//
// Document StartPie's protocol for figuring out and initializing
// which pie to use.
//
// Events:
//   Low level:
//     MouseDown=>PressedDown MouseMove=>PressedMove MouseUp=>PressedUp
//     DragStart MouseDrag=>DragMove DragStop
//     MouseOver=>UnpressedMove, UnpressedStay
//     Hover Drift
//   Tracker:
//     PressedDownUI PressedUpUI
//     PressedDown PressedUp PressedChanged PositionChanged 
//
// Web Components:
//
//   Best practices:
//     Lower case event names.
//     Reflect properties to attributes, so consumers can use css to style different states.
//     https://developers.google.com/web/fundamentals/web-components/best-practices
// ARIA
//   https://www.w3.org/TR/wai-aria-practices-1.1/#slider_kbd_interaction
//
// Accessibility Object Model
//   https://github.com/WICG/aom/blob/gh-pages/explainer.md#custom-elements-apis
//
// Lion
//   https://lion-web-components.netlify.com/?path=/story/intro-lion-web-components--page
//   https://github.com/ing-bank/lion/
//
// Lion people
// https://twitter.com/erikkroes





////////////////////////////////////////////////////////////////////////
// Imports.


////////////////////////////////////////////////////////////////////////
// Interfaces.


export interface PieHandler {
    (pie: Pie, target: any): void;
}


export interface SliceHandler {
    (slice: Slice, pie: Pie, target: any): void;
}


export interface SliceIndexHandler {
    (sliceIndex: number, pie: Pie, target: any): void;
}


export interface ItemHandler {
    (item: Item, slice: Slice, pie: Pie, target: any): void;
}


export interface ItemIndexHandler {
    (itemIndex: number, slice: Slice, pie: Pie, target: any): void;
}


export interface Listener {

    handleStartPie(pie: Pie, target: any): void; // PieHandler
    handleTrackPie(pie: Pie, target: any): void; // PieHandler
    handleStopPie(pie: Pie, target: any): void; // PieHandler
    handleCancelPie(pie: Pie, target: any): void; // PieHandler

    handleConstructPie(pie: Pie, target: any): void; // PieHandler
    handleDeconstructPie(pie: Pie, target: any): void; // PieHandler

    handleLayoutPie(pie: Pie, target: any): void; // PieHandler

    handleShowPie(pie: Pie, target: any): void; // PieHandler
    handleHidePie(pie: Pie, target: any): void; // PieHandler

    handlePressPie(pie: Pie, target: any): void; // PieHandler
    handleReleasePie(pie: Pie, target: any): void; // PieHandler
    handleSelectPie(pie: Pie, target: any): void; // PieHandler

    handleEnterPieCenter(pie: Pie, target: any): void; // PieHandler
    handleTrackPieCenter(pie: Pie, target: any): void; // PieHandler
    handleExitPieCenter(pie: Pie, target: any): void; // PieHandler
    handlePressPieCenter(pie: Pie, target: any): void; // PieHandler
    handleReleasePieCenter(pie: Pie, target: any): void; // PieHandler
    handleSelectPieCenter(pie: Pie, target: any): void; // PieHandler

    handleEnterSlice(slice: Slice, pie: Pie, target: any): void; // SliceHandler
    handleTrackSlice(slice: Slice, pie: Pie, target: any): void; // SliceHandler
    handleExitSlice(slice: Slice, pie: Pie, target: any): void; // SliceHandler
    handlePressSlice(slice: Slice, pie: Pie, target: any): void; // SliceHandler
    handleReleaseSlice(slice: Slice, pie: Pie, target: any): void; // SliceHandler
    handleSelectSlice(slice: Slice, pie: Pie, target: any): void; // SliceHandler

    handleEnterEmptySlice(sliceIndex: number, pie: Pie, target: any): void; // SliceIndexHandler
    handleTrackEmptySlice(sliceIndex: number, pie: Pie, target: any): void; // SliceIndexHandler
    handleExitEmptySlice(sliceIndex: number, pie: Pie, target: any): void; // SliceIndexHandler
    handlePressEmptySlice(sliceIndex: number, pie: Pie, target: any): void; // SliceIndexHandler
    handleReleaseEmptySlice(sliceIndex: number, pie: Pie, target: any): void; // SliceIndexHandler
    handleSelectEmptySlice(sliceIndex: number, pie: Pie, target: any): void; // SliceIndexHandler

    handleEnterItem(item: Item, slice: Slice, pie: Pie, target: any): void; // ItemHandler
    handleTrackItem(item: Item, slice: Slice, pie: Pie, target: any): void; // ItemHandler
    handleExitItem(item: Item, slice: Slice, pie: Pie, target: any): void; // ItemHandler
    handlePressItem(item: Item, slice: Slice, pie: Pie, target: any): void; // ItemHandler
    handleReleaseItem(item: Item, slice: Slice, pie: Pie, target: any): void; // ItemHandler
    handleSelectItem(item: Item, slice: Slice, pie: Pie, target: any): void; // ItemHandler

    handleEnterEmptyItem(itemIndex: number, slice: Slice, pie: Pie, target: any): void; // ItemIndexHandler
    handleTrackEmptyItem(itemIndex: number, slice: Slice, pie: Pie, target: any): void; // ItemIndexHandler
    handleExitEmptyItem(itemIndex: number, slice: Slice, pie: Pie, target: any): void; // ItemIndexHandler
    handlePressEmptyItem(itemIndex: number, slice: Slice, pie: Pie, target: any): void; // ItemIndexHandler
    handleReleaseEmptyItem(itemIndex: number, slice: Slice, pie: Pie, target: any): void; // ItemIndexHandler
    handleSelectEmptyItem(itemIndex: number, slice: Slice, pie: Pie, target: any): void; // ItemIndexHandler

}


////////////////////////////////////////////////////////////////////////
// Pie utilities class definition.


export class Utilities {


    // searchDefault searches a list of dictionaries for
    // a key, the its value in the first dictionary that
    // contains it, or returns a default value if it's
    // not found. The first argument is the key, the next
    // one or more arguments are the dictionaries to search,
    // and the last argument is the default value.
    // So there must be at least three arguments.
    searchDefault(...args: any): any {
        //console.log("searchDefault: key:", arguments[0], "arguments:", arguments);

        const argCount = args.length;

        if (argCount < 2) {
            console.log("searchDefault: Called with nonsensically too few args! Should be: key, object..., default", args);
            return null;
        }

        if (argCount == 2) {
            // Nothing to search so return the default.
            return args[1];
        }

        // The first arg is the key to search for.
        const key = args[0];

        // Search the rest of args for the key, except for the last one.
        // The last arg is the default value, so don't search that one.

        for (let argIndex = 1;
            argIndex < (argCount - 1);
            argIndex++) {

            const dict = args[argIndex];

            // Skip null dicts, for convenience.
            if (!dict) {
                continue;
            }

            const value = dict[key];

            if (value !== undefined) {
                // Found it!
                return value;
            }

        }

        // Didn't find it, so return the default last argument.
        return args[argCount - 1];
    }


    callHandler(name: string, ...args: any[]) {
        const handler = this.searchDefault.apply(this, [name, ...args]);
        handler.apply(null, args);
    }


};


////////////////////////////////////////////////////////////////////////
// Pie class definition.


export class Tracker extends Utilities {


    tracking: boolean = false;
    trackingPressed: boolean = false;
    pressed: boolean = false;
    pressedLast: boolean = false;
    pressedChanged: boolean = true;
    pressedDownTime: number = -1;
    ignoringClick: boolean = false;
    trackingPosition: boolean = false;
    trackingPositionHoverDelay: number = 0.1;
    trackingPositionDriftDelay: number = 0.1;
    trackingPositionHovering: boolean = false;
    trackingPositionHoverTime: number = -1;
    trackingPositionDriftTime: number = -1;
    position: any = { x: 0, y: 0 };
    positionStart: any = { x: 0, y: 0 };
    positionLast: any = { x: 0, y: 0 };
    positionDelta: any = { x: 0, y: 0 };
    screenSize: any = { width: 0, height: 0 };
    shiftKey: boolean = false;
    controlKey: boolean = false;
    altKey: boolean = false;
    distance: number = 0;
    direction: number = 0;
    justSelected: boolean = false;
    pie: Pie | null = null;
    target: any = null;
    listeners: any = {};
    nextListenerId: number = 0;


    addListener(element: any, type: string, options: any) {
        const id = this.nextListenerId++;
        const listener = {
            id,
            element,
            type,
            options,
            handler: (event: any) => {
                console.log('PieTracker: addListener:', 'element:', element, 'type:', type, 'options:', options, 'listener:', listener, 'event:', event);
                this.trigger(listener, event);
            },
        }

        this.listeners[id] = listener;

        listener.element.addEventListener(listener.type, listener.handler, listener.options);

        return id;
    }


    removeListener(id: number) {
        const listener = this.listeners[id];
        if (!listener) {
            return;
        }

        delete this.listeners[id];

        listener.element.removeEventListener(listener.type, listener.handler, listener.options);
    }


    trigger(listener: any, event: any) {
        console.log('PieTracker: trigger:', 'listener:', listener, 'event:', event, 'pie:', this.pie);

        this.pie = this.findPie(listener, event);

        if (!this.pie) {
            return;
        }

    }


    findPie(listener: any, event: any) {
        return this.pie;
    }


}


export class Pie extends Utilities {


    slices: Slice[] | null = null;
    sliceIndex: number = -1;
    itemIndex: number = -1;
    sliceCount: number = 8;
    initialDirection: number = 0.5 * Math.PI;
    subtend: number = 0.0;
    clockwise: boolean = true;
    inactiveDistance: number = 30.0;
    itemDistance: number = 30.0;
    pinned: boolean = false;
    pinToCursor: boolean = true;


    loadFromJSON(json: any): void {
    }


    saveToJSON(): any {
        return {
        };
    }


    trackMouseDown(down: boolean) {
    }


    startPie(position: any, pieID: string, target: any, pinned: boolean) {
    }


    stopPie() {
    }


    cancelPie() {
    }


    constructPie(pie: Pie) {
    }


    deconstructPie(pie: Pie) {
    }


    updatePie(pie: Pie) {
    }


    layoutPie(pie: Pie) {
    }


    showPie(position: any) {
    }


    movePie(pie: Pie, position: any) {
    }


    hidePie() {
    }


    trackPie(position: any, distance: number, direction: number, nextSliceIndex: number, nextItemIndex: number, reset: boolean) {
    }


    ////////////////////////////////////////////////////////////////////////
    // Events


    sendEventName(name: string) {
    }


    ////////////////////////////////////////////////////////////////////////
    // Utilities


    makeParameterSlice(label: string, name: string, calculator: (pie: Pie) => any, updater: (target: any, val: any) => void): any {
        return null;
    }


};


////////////////////////////////////////////////////////////////////////
// Slice class definition.


export class Slice extends Utilities {


    items: Item[] | null = null;


    loadFromJSON(json: any): void {
    }


    saveToJSON(): any {
        return {
        };
    }


};


////////////////////////////////////////////////////////////////////////
// Item class definition.


export class Item extends Utilities {


    loadFromJSON(json: any): void {
    }


    saveToJSON(): any {
        return {
        };
    }


};


////////////////////////////////////////////////////////////////////////
