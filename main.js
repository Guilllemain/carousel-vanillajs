/**
 * Add touch navigation for mobile
 */
class CarouselTouchPlugin {

    /**
     * 
     * @param {Carousel} carousel 
     */
    constructor (carousel) {
        carousel.container.addEventListener('dragstart', event => event.preventDefault())
        carousel.container.addEventListener('mousedown', this.startDrag.bind(this))
        carousel.container.addEventListener('touchstart', this.startDrag.bind(this))
        window.addEventListener('mousemove',this.drag.bind(this))
        window.addEventListener('touchmove',this.drag.bind(this))
        window.addEventListener('mouseup',this.endDrag.bind(this))
        window.addEventListener('touchend',this.endDrag.bind(this))
        window.addEventListener('touchcancel',this.endDrag.bind(this))
        this.carousel = carousel
    }

    /**
     * Start moving the carousel on touch or mousepress
     * @param {MouveEvent|TouchEvent} event 
     */
    startDrag (event) {
        if (event.touches) {
            if (event.touches.length > 1) {
                return
            } else {
                event = event.touches[0]
            }
        }
        this.origin = {x: event.screenX, y: event.screenY}
        this.width = this.carousel.containerWidth
        this.carousel.disableTransition()
    }

    /**
     * Move slides
     * @param {MouveEvent|TouchEvent} event 
     */
    drag (event) {
        if (this.origin) {
            const point = event.touches ? event.touches[0] : event
            const translate = {x: point.screenX - this.origin.x, y: point.screenY - this.origin.y}
            if (event.touches && Math.abs(translate.x) > Math.abs(translate.y)) {
                event.preventDefault()
                event.stopPropagation()
            }
            const baseTranslate = this.carousel.currentSlide * -100 / this.carousel.items.length
            this.lastTranslate = translate
            this.carousel.translate(baseTranslate + 100 * translate.x / this.width)
            console.log(translate)
        }
    }

    /**
     * Stop moving when the user release the mouse or touch out his device
     * @param {MouveEvent|TouchEvent} event 
     */
    endDrag(event) {
        if (this.origin && this.lastTranslate) {
            this.carousel.enableTransition()
            if (Math.abs(this.lastTranslate.x / this.carousel.carouselWidth) > 0.2) {
                if (this.lastTranslate.x < 0 ) {
                    this.carousel.next()
                } else {
                    this.carousel.prev()
                }
            } else {
                this.carousel.goToSlide(this.carousel.currentSlide)
            }
        }
        this.origin = null
    }
}

class Carousel {
    
    /**
     * This callback type is called 'requestCallback' and is displayed as a global symbol.
     * @callback moveCallback
     * @param {Number} index 
     */


    /**
     * @param {HTMLElement} element 
     * @param {Object} options 
     * @param {Object} [options.slidesToScroll = 1] Number of elements to slide 
     * @param {Object} [options.slidesVisible = 1] Number of elements visible
     * @param {Boolean} [options.loop = false] Should we go back to the beginning of the carousel once the end is reached
     * @param {Boolean} [options.pagination = false] Add small dots as pagination
     * @param {Boolean} [options.navigation = true] Add left and right arrow to navigate
     * @param {Boolean} [options.infinite = false] Add infinite scrolling
     */
    constructor (element, options = {}) {
        this.element = element
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1,
            loop: false,
            pagination: false,
            navigation: true,
            infinite: false
        }, options)
        let children = [].slice.call(element.children)
        this.currentSlide = 0
        this.moveCallbacks = []
        this.isMobile = false

        // DOM MODIFICATION
        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel__container')
        this.root.setAttribute('tabindex', '0')
        this.root.appendChild(this.container)
        this.element.appendChild(this.root)
        this.items = children.map(child => {
            let item = this.createDivWithClass('carousel__item')
            item.appendChild(child)
            return item
        });
        if (this.options.infinite) {
            this.offset = this.options.slidesVisible + this.options.slidesToScroll
            this.items = [
                ...this.items.slice(this.items.length - this.offset).map(item => item.cloneNode(true)),
                ...this.items,
                ...this.items.slice(0, this.offset).map(item => item.cloneNode(true))
            ]
            this.goToSlide(this.offset, false)
        }
        this.items.forEach(item => this.container.appendChild(item))
        this.setStyle()
        if (this.options.navigation) this.createNavigation()
        if (this.options.pagination) this.createPagination()

        // EVENTS
        this.moveCallbacks.forEach(cb => cb(this.currentSlide))
        this.onWindowResize()
        window.addEventListener('resize', this.onWindowResize.bind(this))
        this.root.addEventListener('keyup', event => {
            if (event.key === 'ArrowRight' || event.key === 'Right') {
                this.next()
            } else if (event.key === 'ArrowLeft' || event.key === 'Left') {
                this.prev()
            }
        })
        if (this.options.infinite) this.container.addEventListener('transitionend', this.resetInfinite.bind(this))
        new CarouselTouchPlugin(this)
    }


    
    /**
     * Set style for the carousel elements
     */
    setStyle () {
        const ratio = this.items.length / this.slidesVisible
        this.container.style.width = ratio * 100 + '%'
        this.items.forEach(item => item.style.width = ((100 / this.slidesVisible) / ratio) + '%')
    }

    /**
     * Create navigation arrows
     */
    createNavigation() {
        let nextButton = this.createDivWithClass('carousel__next');
        let prevButton = this.createDivWithClass('carousel__prev');
        this.root.appendChild(nextButton)
        this.root.appendChild(prevButton)
        nextButton.addEventListener('click', this.next.bind(this))
        prevButton.addEventListener('click', this.prev.bind(this))
        if (this.options.loop === true) return
        this.onMove(index => {
            if (index === 0) {
                prevButton.classList.add('carousel__prev--hidden')
            } else {
                prevButton.classList.remove('carousel__prev--hidden')
            }
            if (this.currentSlide + this.slidesVisible >= this.items.length) {
                nextButton.classList.add('carousel__next--hidden')
            } else {
                nextButton.classList.remove('carousel__next--hidden')
            }
        } )
    }

    /**
     * Create pagination dots
     */
    createPagination() {
        const pagination = this.createDivWithClass('carousel__pagination')
        let buttons = []
        this.root.appendChild(pagination)
        for (let i = 0; i < (this.items.length - 2 * this.offset); i = i + this.options.slidesToScroll) {
            const button = this.createDivWithClass('pagination__button')
            button.addEventListener('click', () => this.goToSlide(i + this.offset))
            pagination.appendChild(button)
            buttons.push(button)
        }
        this.onMove(index => {
            const count = this.items.length - 2 * this.offset
            const activeButton = buttons[Math.floor(((index - this.offset) % count) / this.options.slidesToScroll)]
            if (activeButton) {
                buttons.forEach(button => button.classList.remove('pagination__button--active'))
                activeButton.classList.add('pagination__button--active')
            }
        })
    }

    next() {
        this.goToSlide(this.currentSlide + this.slidesToScroll)
    }

    prev() {
        this.goToSlide(this.currentSlide - this.slidesToScroll)
    }

    disableTransition() {
        this.container.style.transition = 'none'
    }

    enableTransition() {
        this.container.style.removeProperty('transition')
    }

    translate (percent) {
        this.container.style.transform = `translate3d(${percent}%, 0, 0)`
    }

    /**
     * 
     * @param {moveCallback} callback 
     */
    onMove(callback) {
        this.moveCallbacks.push(callback)
    }

    onWindowResize () {
        const mobile = window.innerWidth < 800
        if (mobile !== this.isMobile) {
            this.isMobile = mobile
            this.setStyle()
            this.moveCallbacks.forEach(cb => cb(this.currentSlide))
        }
    }

    /**
     * Move the carousel to the targeted slide
     * @param {Number} index
     * @param {Boolean} [animation = true]
     */
    goToSlide(index, animation = true) {
        if (index < 0) {
            if (this.options.loop) {
                index = this.items.length - this.slidesVisible
            } else {
                return
            }
        } else if (index >= this.items.length || (this.currentSlide + this.slidesVisible >= this.items.length && index > this.currentSlide)) {
            if (this.options.loop) {
            index = 0
            } else {
                return
            }
        }
        if (!animation) {
            this.disableTransition()
        }
        let translateX = index * -100 / this.items.length
        this.translate(translateX)
        this.container.offsetHeight // force repaint
        if (!animation) {
            this.enableTransition()
        }
        this.currentSlide = index
        this.moveCallbacks.forEach(cb => cb(index))
    }

    /**
     * Move the container to simulate infinite scrolling
     */
    resetInfinite() {
        if (this.currentSlide <= this.options.slidesToScroll) {
            this.goToSlide(this.currentSlide + (this.items.length - 2 * this.offset), false)
        } else if (this.currentSlide >= this.items.length - this.offset) {
            this.goToSlide(this.currentSlide - (this.items.length - 2 * this.offset), false)
        }
    }

    /**
     * @param {String} className
     * @returns {HTMLElement} 
     */
    createDivWithClass (className) {
        let div = document.createElement('div');
        div.setAttribute('class', className);
        return div;
    }

    /**
     * @returns {Number}
     */
    get slidesToScroll () {
        return this.isMobile ? 1 : this.options.slidesToScroll
    }

    /**
     * @returns {Number}
     */
    get slidesVisible() {
        return this.isMobile ? 1 : this.options.slidesVisible
    }

    /**
     * @returns {Number}
     */
    get containerWidth() {
        return this.container.offsetWidth
    }

    /**
     * @returns {Number}
     */
    get carouselWidth() {
        return this.root.offsetWidth
    }
}


document.addEventListener('DOMContentLoaded', () => {  
    new Carousel (document.querySelector('#carousel'), {
        slidesToScroll: 1,
        slidesVisible: 3,
        loop: true,
        pagination: true,
        navigation: true,
        infinite: true
    })
})