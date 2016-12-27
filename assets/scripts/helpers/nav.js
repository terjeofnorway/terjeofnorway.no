class Nav {


    constructor(){
        this.addEventListeners();
    }


    addEventListeners(){
        document.getElementById('mobileMenuToggle').addEventListener('click', this.mobileMenuClickEventListener.bind(this));
    }

    mobileMenuClickEventListener(){
        let menu = document.getElementById('navigation').getElementByName('ul');

        menu.hasClass('collapsed') == true ? menu.removeClass('collapsed') : menu.addClass('collapsed');

    }
}