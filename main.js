class Carousel {
    
    /**
     * @param {HTMLElement} element 
     * @param {Object} options 
     * @param {Object} options.slidesToScroll Number of elements to slide 
     * @param {Object} options.slidesVisible Number of elements visible
     */
    constructor (element, options = {}) {
        this.element = element
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1
        }, options)
        let children = [].slice.call(element.children)
        this.currentSlide = 0
        this.root = this.createDivWithClass('carousel')
        this.container = this.createDivWithClass('carousel__container')
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
    }


    
    /**
     * Set style for the carousel elements
     */
    setStyle () {
        const ratio = this.items.length / this.options.slidesVisible
        this.container.style.width = ratio * 100 + '%'
        this.items.forEach(item => item.style.width = ((100 / this.options.slidesVisible) / ratio) + '%')
    }

    createNavigation() {
        let nextButton = this.createDivWithClass('carousel__next');
        let prevButton = this.createDivWithClass('carousel__prev');
        this.root.appendChild(nextButton)
        this.root.appendChild(prevButton)
        nextButton.addEventListener('click', this.next.bind(this))
        prevButton.addEventListener('click', this.prev.bind(this))
    }

    next() {
        this.goToSlide(this.currentSlide + this.options.slidesToScroll)
    }

    prev() {
        this.goToSlide(this.currentSlide - this.options.slidesToScroll)
    }

    /**
     * Move the carousel to the targeted slide
     * @param {Number} index
     */
    goToSlide(index) {
        let translateX = index * -100 / this.items.length
        this.container.style.transform = `translate3d(${translateX}%, 0, 0)`
        this.currentSlide = index
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
}


document.addEventListener('DOMContentLoaded', () => {  
    new Carousel (document.querySelector('#carousel'), {
        slidesToScroll: 1,
        slidesVisible: 3
    })
})