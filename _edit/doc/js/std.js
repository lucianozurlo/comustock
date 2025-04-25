/**
 * Author: Shadow Themes
 * Author URL: https://shadow-themes.com
 */
"use strict";
const TEMPLATE_NAME = 'Bringer HTML';
const VERSION = '1.0';
// CODE HIGHLIGHTER
function codeHL() {

    // CSS Highlighter
    jQuery('.chl-css:not(.is-init)').each(function() {
        let $css = jQuery(this);
        $css.addClass('is-init');

        // Selectors
        $css.find('sel').each(function() {
            let $this = jQuery(this),
                text = $this.text();
            if ( text.indexOf('.') === 0) {
                $this.addClass('is-class');
            } else if ( text.indexOf('#') === 0) {
                $this.addClass('is-id');
            } else if ( text.indexOf(':') === 0) {
                $this.addClass('is-spec');
            } else {
                $this.addClass('is-tag');
            }

            if (text.indexOf('::') > 0) {
                let tSplit = text.split('::');
                $this.html(tSplit[0] + '<span class="chl-dots">::</span>' + '<span class="chl-spec">' + tSplit[1] + '</span>');
            } else if (text.indexOf(':') > 0) {
                let tSplit = text.split(':');
                $this.html(tSplit[0] + '<span class="chl-dots">:</span>' + '<span class="chl-spec">' + tSplit[1] + '</span>');
            }
        });

        // Attributes
        $css.find('attr').each(function() {
            let $this = jQuery(this),
                text = $this.text();
            if ( text.indexOf(':') > 0) {
                let tSplit = text.split(':'),
                    addCl01 = 'chl-css-attr-n',
                    addCl02 = 'chl-css-attr-v'

                if (tSplit[0] == 'content') {
                    $this.addClass('is-content');
                }
                if (tSplit[0] == 'color') {
                    $this.addClass('is-color');
                }
                if (tSplit[1].indexOf('var(') > -1) {
                    addCl02 += ' is-var';
                    let vSplit = tSplit[1].split('(');
                    let vSplit2 = vSplit[1].split(')');
                    tSplit[1] = '<span class="chl-css-var">' + vSplit[0] + '(' + '<span class="chl-css-var-val">'+ vSplit2[0] +'</span>' + ')' + '</span>';
                }
                $this.html('<span class="' + addCl01 + '">' + tSplit[0] +'</span>' + '<span class="chl-dots">:</span>' + '<span class="' + addCl02 + '">' + tSplit[1] + '</span>');
            }
        });
    });
}

class STD {
    constructor() {
        const _self = this;
        this.$el = {
            body: jQuery('body'),
            main: jQuery('main.std-main'),
            win: jQuery(window)
        }
        this.cfg = {
            menu: [
                {
                    'label': 'Welcome',
                    'url': 'index.html',
                    'icon': 'home',
                },
                {
                    'label': 'Overview',
                    'url': 'overview.html',
                    'icon': 'overview',
                },
                {
                    'label': 'Code Structure',
                    'url': 'structure.html',
                    'icon': 'structure',
                },
                {
                    'label': 'Animations',
                    'url': 'animations.html',
                    'icon': 'animations',
                },
                {
                    'label': 'Header and Menu',
                    'url': 'header.html',
                    'icon': 'header',
                },
                {
                    'label': 'Footer and Socials',
                    'url': 'footer.html',
                    'icon': 'footer',
                },
                {
                    'label': 'UI Elements',
                    'url': 'ui-elements.html',
                    'icon': 'ui-elements',
                },
                {
                    'label': 'Grid System',
                    'url': 'grid.html',
                    'icon': 'grid',
                },
                {
                    'label': 'Content Part',
                    'url': 'content.html',
                    'icon': 'content',
                },
                {
                    'label': 'Portfolio',
                    'url': 'portfolio.html',
                    'icon': 'listing',
                },
                {
                    'label': 'Contact Form',
                    'url': 'contact.html',
                    'icon': 'contact',
                },
                {
                    'label': 'Customization',
                    'url': 'customize.html',
                    'icon': 'customize',
                },
                {
                    'label': 'Credits',
                    'url': 'credits.html',
                    'icon': 'credits',
                },
            ],
            counter: false,
        }

        // NAVIGATION
        // ==========
        this.$el.nav = jQuery('<nav class="std-nav"/>').appendTo(this.$el.body).wrap('<div class="std-nav-wrap"/>');
        this.$el.nav.append(`<h6 class="template_info">${TEMPLATE_NAME}<span class="version">${VERSION}</span></h6>`);
        this.$el.nav_menu = jQuery('<ul class="std-nav-menu"/>').appendTo(this.$el.nav);
        this.$el.mob_nav_toggler = jQuery('<a href="javascript:void(0)" class="std-mobile-nav-toggler"><i></i></a>').appendTo(this.$el.body);
        this.$el.mob_nav_toggler.on('click', function() {
            _self.$el.body.toggleClass('show-nav');
        })

        // Get Current page
        this.current_page = window.location.pathname.split("/").pop();
        if (this.current_page == '') {
            this.current_page = 'index';
        }
        this.current_idx = -1;
        
        this.cfg.menu.forEach((item, i) => {
            let url = item.url;
            if ( window.location.pathname.indexOf('pages/') < 0) {
                if ( url !== 'index.html' ) {
                    url = 'pages/' + url;
                }
            } else {
                if ( url == 'index.html' ) {
                    url = '../' + url;
                }
            }
            if ( item.url.indexOf(_self.current_page) > -1 ) {
                _self.current_idx = i;
            }
            _self.$el.nav_menu.append(`
                <li`+ (item.url.indexOf(_self.current_page) > -1 ? ` class="is-active"` : ``) +`>
                    <a href="${url}">
                        <i class="std-icon-${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                </li>
            `);
        });

        // INTRO MENU
        // ==========
        if ( jQuery('.intro-navigation').length ) {
            this.$el.ig_wrap = jQuery('<div class="std-ig-wrap"/>').appendTo('.intro-navigation');
            this.cfg.menu.forEach((item, i) => {
                if ( item.url.indexOf('index') < 0 ) {
                    this.$el.ig_wrap.append(`
                    <div class="std-ig-item">
                        <i class="std-icon std-icon-${item.icon}"></i>
                        <span>${item.label}</span>
                        <a href="pages/${item.url}"></a>
                    </div>
                    `);
                }
            });
        }

        // UI ELEMENTS
        // ===========
        this.$el.b2t = jQuery('<a href="javascript:void(0)" class="std-back2top"></a>')
            .appendTo(this.$el.body)
            .on('click', function(e) {
                e.preventDefault();
                jQuery('html, body').stop().animate( { scrollTop: 0 }, 500 );
            });
        this.$el.body.append('<div class="std-spotlight"/>');
        if ( jQuery('.chapter-title-wrap').length ) {
            let this_idx = this.current_idx + 1 < 10 ? `0` + (this.current_idx + 1) : this.current_idx + 1;
            jQuery('.chapter-title-wrap').append(`
                <h2>
                    <sup>${this_idx}.</sup>
                    ${this.cfg.menu[this.current_idx].label}
                </h2>
            `);
        }

        // CHAPTER NAVIGATION
        // ==================
        if ( jQuery('.std-next-chapter').length ) {
            let next_chapter = this.cfg.menu[this.current_idx + 1];
            this.$el.next_chapter = jQuery(`
            <div class="std-next-chapter-link">
                <h3>Next Chapter</h3>
                <a href="${next_chapter.url}" class="std-caption">${next_chapter.label}</a>
            </div>
            `).appendTo('.std-next-chapter');
        }

        // CODE HIGHLIGHTER
        // ================
        if ( jQuery('.chl-html').length ) {
            jQuery('.chl-html').each(function() {
                let $wrap = jQuery(this);
                // Tags
                $wrap.children('tag').each(function() {
                    let $tag = jQuery(this);
                    _self.html_tag_chl( $tag );
                });
                // Comments
                $wrap.children('span').each(function() {
                    jQuery(this).addClass('chl-comment').text('<!-- ' + jQuery(this).text() + ' -->');
                });
            });
        }
        if ( jQuery('tag.inline-html').length ) {
            jQuery('tag.inline-html').each(function() {
                let $tag = jQuery(this);
                _self.html_tag_chl($tag);
                $tag.wrap('<code class="chl-inline chl-html"/>');
            });
        }


        // EVENTS
        // ======
        this.$el.win.on('scroll', function() {
            let current_scroll = _self.$el.win.scrollTop();
            if ( current_scroll > window.innerHeight ) {
                _self.$el.b2t.addClass('b2t-visible');
            } else {
                _self.$el.b2t.removeClass('b2t-visible');
            }
        }).on('resize', function() {

        }).on('load', function() {
            let current_scroll = _self.$el.win.scrollTop();
            if ( current_scroll > window.innerHeight ) {
                _self.$el.b2t.addClass('b2t-visible');
            } else {
                _self.$el.b2t.removeClass('b2t-visible');
            }
        });
        // Show Page
        setTimeout(function() {
            _self.$el.body.addClass('is-loaded');
        }, 100, _self);
    }
    html_tag_chl( $tag ) {
        $tag.prepend('<span>\u003C</span>');
        if ( typeof $tag.attr('data-attrs') !== 'undefined' ) {
            const attrs = $tag.data('attrs');
            for (let [type, value] of Object.entries(attrs)) {
                let attr_class = 'chl-attr';
                if ( type.indexOf('id') === 0 ) {
                    attr_class = 'is-id';
                }
                if ( type.indexOf('data') === 0 ) {
                    attr_class = 'is-data';
                }
                if ( type.indexOf('class') === 0 ) {
                    attr_class = 'is-class';
                }
                if ( type.indexOf('!') === 0 ) {
                    attr_class = 'chl-imp';
                    type = type.substring(1);
                }
                if ( value == '' ) {
                    $tag.append(`<attr class="${attr_class}"> ${type}</attr>`);
                } else {
                    $tag.append(`<attr class="${attr_class}"> ${type}="<span class="chl-attr-val">${value}</span>"</attr>`);
                }
            }
        }
        if ($tag.hasClass('is-closed')) {
            $tag.append('<span>/\u003E</span>');
        } else {
            $tag.append('<span>\u003E</span>');
        }
    }
}

// Init
codeHL();
const st_docs = new STD();