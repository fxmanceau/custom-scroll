import VirtualScroll from "virtual-scroll"
import { lerp } from './utils/maths'

export default class Smooth {
    constructor(options = {}) {
        this.options = options

        this.windowSize = { width: window.innerWidth, height: window.innerHeight }
        this.containerSize = { width: this.options.el.offsetWidth, height: this.options.offsetHeight }

        this.scrollPosition = { x: 0, y: 0 }
        this.lerpedScrollPosition = { x: 0, y: 0 }

        this.sections = []

        this.parallaxElements = []

        this.isRaf = false
        this.isScrolling = false

        this.executeRaf = this.executeRaf.bind(this)
        this.updateScrollPosition = this.updateScrollPosition.bind(this)

        this.init()
    }

    init() {
        this.vs = new VirtualScroll({
            el: this.options.el,
            passive: true,
            mouseMultiplier: this.options.multiplier,
            firefoxMultiplier: this.options.firefoxMultiplier,
            touchMultiplier: this.options.touchMultiplier,
            keyStep: this.options.keyStep,
            useTouch: this.options.useTouch
        })
        this.vs.on(this.updateScrollPosition)

        this.addSections()
        this.addParallaxElements()

        this.resize()
    }

    handleResize() {
        this.updateWindowSize()
        this.updateContainerSize()
        // this.updateParallaxSize()
    }

    resize() {
        this.handleResize()
        window.addEventListener('resize', this.handleResize.bind(this))
    }

    updateScrollPosition(e) {
        this.isScrolling = true

        if (this.isRaf === false) {
            this.raf = requestAnimationFrame(this.executeRaf)
        }

        if (this.options.direction === 'vertical') {
            if (this.scrollPosition.y + e.deltaY > 0 ||
                this.containerSize.height <= this.windowSize.height) {
                this.scrollPosition.y = 0
            }
            else if ((this.containerSize.height <= this.windowSize.height) && (this.scrollPosition.y + e.deltaY < this.containerSize.height)) {
                this.scrollPosition.y = -this.containerSize.height
            }
            else if (this.scrollPosition.y + e.deltaY < -(this.containerSize.height - this.windowSize.height)) {
                this.scrollPosition.y = -(this.containerSize.height - this.windowSize.height)
            }
            else {
                this.scrollPosition.y += e.deltaY
            }
        }
        else if (this.options.direction === 'horizontal') {
            if (this.scrollPosition.x + e.deltaX > 0 ||
                this.scrollPosition.x + e.deltaY > 0 ||
                this.containerSize.width <= this.windowSize.width) {
                this.scrollPosition.x = 0
            }
            else if ((this.containerSize.width <= this.windowSize.width) &&
                ((this.scrollPosition.x + e.deltaX < this.containerSize.width) ||
                    (this.scrollPosition.x + e.deltaY < this.containerSize.width))) {
                this.scrollPosition.x = -this.containerSize.width
            }
            else if (this.scrollPosition.x + e.deltaX < -(this.containerSize.width - this.windowSize.width) ||
                this.scrollPosition.x + e.deltaY < -(this.containerSize.width - this.windowSize.width)) {
                this.scrollPosition.x = -(this.containerSize.width - this.windowSize.width)
            }
            else {
                this.scrollPosition.x += e.deltaX + e.deltaY
            }
        }
    }

    updateContainer(el, x, y, delay) {
        if (!delay) {
            this.transform(el, x, y)
        } else {

            const computedLerp = {
                x: Math.round(lerp(this.lerpedScrollPosition.x, x, delay) * 1000) / 1000,
                y: Math.round(lerp(this.lerpedScrollPosition.y, y, delay) * 1000) / 1000
            }

            if (computedLerp.x === this.lerpedScrollPosition.x && computedLerp.y === this.lerpedScrollPosition.y) {
                this.isRaf = false
                this.isScrolling = false
            }

            this.lerpedScrollPosition.x = computedLerp.x
            this.lerpedScrollPosition.y = computedLerp.y

            this.transform(el, this.lerpedScrollPosition.x, this.lerpedScrollPosition.y, delay)
        }
    }

    transform(el, x, y) {
        const transformValue = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${x},${y},0,1)`

        el.style.webkitTransform = transformValue
        el.style.msTransform = transformValue
        el.style.transform = transformValue
    }


    executeRaf() {
        if (this.isScrolling === true) {
            this.isRaf = true
            this.raf = requestAnimationFrame(this.executeRaf)

            if (this.sections.length === 0) {
                this.updateContainer(this.options.el, this.scrollPosition.x, this.scrollPosition.y, this.options.lerp)
            }
            else {
                this.updateSection(this.scrollPosition.x, this.scrollPosition.y, this.options.lerp)
            }

            this.updateParallax()
        }
    }

    updateWindowSize() {
        this.windowSize.width = window.innerWidth
        this.windowSize.height = window.innerHeight
    }

    updateContainerSize() {
        this.containerSize.width = this.options.el.offsetWidth
        this.containerSize.height = this.options.el.offsetHeight
    }

    updateParallaxSize() {
        this.parallaxElements.forEach(item => {
            item.bounding = item.el.getBoundingClientRect()
            item.parentBounding = item.el.parentNode.getBoundingClientRect()
        })

        this.updateParallax()
    }

    addParallaxElements() {
        document.querySelectorAll('[data-parallax').forEach(el => {
            const elementBounding = el.getBoundingClientRect()
            const parentBounding = el.parentNode.getBoundingClientRect()
            const elementContext = {
                el: el,
                bounding: elementBounding,
                speed: el.dataset.speed ? parseFloat(el.dataset.speed) : 1,
                direction: el.dataset.speed ? el.dataset.direction : 'vertical',
                parent: el.parentNode,
                parentBounding: parentBounding,
                offset: { x: elementBounding.width - parentBounding.width, y: elementBounding.height - parentBounding.height },
                progress: { x: 0, y: 0 }
            }
            this.parallaxElements.push(elementContext)
        })
    }

    addSections() {
        document.querySelectorAll('[data-section]').forEach(el => {
            const elementBounding = el.getBoundingClientRect()
            const elementContext = {
                el: el,
                bounding: elementBounding,
                progress: { x: 0, y: 0 },
                offset: { x: 0, y: 0 },
                active: true
            }
            this.sections.push(elementContext)
        })

    }

    updateSection(x, y, delay) {
        this.sections.forEach((item, i) => {
            if (!delay) {
                this.transform(item.el, x, y)
            } else {

                const computedLerp = {
                    x: Math.round(lerp(this.lerpedScrollPosition.x, x, delay) * 1000) / 1000,
                    y: Math.round(lerp(this.lerpedScrollPosition.y, y, delay) * 1000) / 1000
                }

                if (computedLerp.x === this.lerpedScrollPosition.x && computedLerp.y === this.lerpedScrollPosition.y) {
                    this.isRaf = false
                    this.isScrolling = false
                }

                this.lerpedScrollPosition.x = computedLerp.x
                this.lerpedScrollPosition.y = computedLerp.y

                if ((this.lerpedScrollPosition.x + item.bounding.right >= -this.windowSize.height / 2 &&
                    item.bounding.left + this.lerpedScrollPosition.x <= this.windowSize.width + this.windowSize.width / 2) &&
                    this.options.direction === 'horizontal') {

                    item.active = true
                    this.transform(item.el, this.lerpedScrollPosition.x, this.lerpedScrollPosition.y, delay)
                }
                else if ((this.lerpedScrollPosition.y + item.bounding.bottom >= -this.windowSize.height / 2 &&
                    item.bounding.top + this.lerpedScrollPosition.y <= this.windowSize.height + this.windowSize.height / 2) &&
                    this.options.direction === 'vertical') {


                    this.transform(item.el, this.lerpedScrollPosition.x, this.lerpedScrollPosition.y, delay)
                }

            }
        })
    }

    updateParallax() {
        this.parallaxElements.forEach(item => {
            item.progress.x = ((item.parentBounding.left + item.parentBounding.width / 2) + this.lerpedScrollPosition.x - this.windowSize.width / 2) / (this.windowSize.width * 0.75)
            item.progress.y = ((item.parentBounding.top + item.parentBounding.height / 2) + this.lerpedScrollPosition.y - this.windowSize.height / 2) / (this.windowSize.height * 0.75)

            item.progress.x = Math.min(Math.max(item.progress.x * item.speed, -1), 1)
            item.progress.y = Math.min(Math.max(item.progress.y * item.speed, -1), 1)

            if ((item.progress.x > -1 && item.progress.x < 1) && (item.progress.y > -1 && item.progress.y < 1)) {
                this.transform(item.el, item.offset.x / 2 * item.progress.x, item.offset.y / 2 * item.progress.y)
            }
        })
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize)
        this.vs.destroy()
    }
}