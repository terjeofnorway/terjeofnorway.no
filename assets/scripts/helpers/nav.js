class Nav {


    constructor(){
        this.addEventListeners();
    }


    /** Add event listeners for mist aspects of the Nav item.
     * @return void
     */
    addEventListeners(){
        document.getElementById('mobileMenuToggle').addEventListener('click', this.mobileMenuClickEventListener.bind(this));
    }


    /** Expand or collapse the mobile menu when the menu item is toggled.
     * @return void
      */
    mobileMenuClickEventListener(){
        let menu = document.getElementById('navigation').getElementByName('ul');
        menu.hasClass('collapsed') == true ? menu.removeClass('collapsed') : menu.addClass('collapsed');
    }
}