class A {
    action;

    act() {
        console.log("actions is:",this.action);
    }
}

class B extends A {
    constructor(){
        super();
        this.action = "foo";
    }

    act() {
        console.log("B act");
        super.act();
    }
}

const b = new B();
b.act();
