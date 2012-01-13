"use strict";
var Tabs;

Tabs = function () {
    var $, tabSets, i, initTabSet, instance;
    
    instance = this;
    
    this.getTabset = function (index) {
        return tabSets[index];
    };
    
    this.setActiveTab = function (setIndex, tabIndex) {
        var set, tabs, i, contents;
        set = this.getTabset(setIndex);
        tabs = set.getElementsByTagName('span');
        for (i = tabs.length; i--;) {
            if (tabs[i].parentNode == set) {
                tabs[i].className = '';
            }
        }
        tabs[tabIndex].className = 'active';
        contents = set.getElementsByTagName('div');
        for (i = contents.length; i-- > 1;) {
            if (contents[i].parentNode == set) {
                contents[i].className = '';
            }
        }
        contents[tabIndex + 1].className = 'active';
    };
    
    $ = function (selector) {
        return document.querySelectorAll(selector);
    };
    
    initTabSet = function (set, setIndex) {
        var tabs, i;
        tabs = set.getElementsByTagName('span');
        for (i = tabs.length; i--;) {
            if (tabs[i].parentNode == set) {
                tabs[i].tabsetIndex = setIndex;
                tabs[i].tabsetTabIndex = i;
                tabs[i].addEventListener('click', function () {
                    instance.setActiveTab(this.tabsetIndex, this.tabsetTabIndex);
                }, false);
            }
        }
    };
    
    tabSets = $('.tabs');
    for (i = tabSets.length; i--;) {
        initTabSet(tabSets[i], i);
    }
};
