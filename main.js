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
     */
    constructor (element, options = {}) {
        this.element = element
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1,
            loop: false
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
            this.container.appendChild(item)
            return item
        });
        this.setStyle()
        this.createNavigation()

        // EVENTS
        this.moveCallbacks.forEach(cb => cb(0))
        this.onWindowResize()
        window.addEventListener('resize', this.onWindowResize.bind(this))
        this.root.addEventListener('keyup', event => {
            if (event.key === 'ArrowRight' || event.key === 'Right') {
                this.next()
            } else if (event.key === 'ArrowLeft' || event.key === 'Left') {
                this.prev()
            }
        })
    }


    
    /**
     * Set style for the carousel elements
     */
    setStyle () {
        const ratio = this.items.length / this.slidesVisible
        this.container.style.width = ratio * 100 + '%'
        this.items.forEach(item => item.style.width = ((100 / this.slidesVisible) / ratio) + '%')
    }

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

    next() {
        this.goToSlide(this.currentSlide + this.slidesToScroll)
    }

    prev() {
        this.goToSlide(this.currentSlide - this.slidesToScroll)
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
     */
    goToSlide(index) {
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
        let translateX = index * -100 / this.items.length
        this.container.style.transform = `translate3d(${translateX}%, 0, 0)`
        this.currentSlide = index
        this.moveCallbacks.forEach(cb => cb(index))
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
}


document.addEventListener('DOMContentLoaded', () => {  
    new Carousel (document.querySelector('#carousel'), {
        slidesToScroll: 1,
        slidesVisible: 3,
        loop: true
    })
})