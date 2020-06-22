<template>
    <div id="app">
        <button class="button" @click="direction === 'vertical' ? (direction = 'horizontal') : (direction = 'vertical')">
            Toggle scroll direction
        </button>
        <div
            ref="container"
            :class="[
                'container',
                {
                    vertical: this.direction === 'vertical',
                    horizontal: this.direction === 'horizontal'
                }
            ]"
        >
            <section v-for="(item, i) in 10" :key="item.id" class="section" data-section ref="section">
                <div class="block-1">
                    <img ref="parallax" data-parallax data-speed="-0.3" :src="`https://picsum.photos/200?random=${i}`" alt class="img" />
                </div>
                <div class="block-2">
                    <img ref="parallax" data-parallax data-speed="-0.3" :src="`https://picsum.photos/300?random=${i}`" alt class="img" />
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import LocomotiveScroll from 'locomotive-scroll'
import VirtualScroll from 'virtual-scroll'

import Scroll from './helpers/Scroll'

export default {
    name: 'App',
    components: {},
    data() {
        return {
            direction: 'horizontal'
        }
    },
    watch: {
        direction() {
            this.destroyScroll()

            const transformValue = ''

            this.$refs.container.style = transformValue
            this.$refs.container.style = transformValue
            this.$refs.container.style = transformValue

            setTimeout(() => {
                this.createScroll()
            }, 100)
        }
    },
    methods: {
        createScroll() {
            this.scroll = new Scroll({
                el: this.$refs.container,
                direction: this.direction,
                lerp: 0.05,
                multiplier: 1,
                firefoxMultiplier: 15,
                touchMultiplier: 10,
                keyStep: 120,
                useTouch: true,
                loop: true
            })
        },
        destroyScroll() {
            this.scroll.destroy()
        }
    },
    mounted() {
        this.createScroll()
    },
    beforeDestroy() {
        this.destroyScroll()
    }
}
</script>

<style lang="scss">
html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    overscroll-behavior: none;
}
#app {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    .button {
        z-index: 999;
        position: relative;
    }

    .container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 50px;
        padding-bottom: 0;
        margin: 0;
        position: absolute;
        top: 0;
        left: 0;

        &.vertical {
            flex-direction: column;
            width: 100%;
            height: min-content;
        }
        &.horizontal {
            flex-direction: row;
            width: min-content;
            height: 100%;
        }

        & div {
            flex-shrink: 0;
        }

        .block-1,
        .block-2 {
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;

            img {
                width: 200%;
                object-fit: cover;
                // overflow: hidden;
            }
        }
    }

    .section {
        border-right: 1px solid red;

        &:first-child {
            background: #f7f096;
        }
    }

    .block-1 {
        width: 500px;
        height: 50vh;
        margin: 50px;
        background-color: rgb(214, 214, 214);
    }
    .block-2 {
        width: 250px;
        height: 40vh;
        margin: 50px;
        background-color: #f7f096;
        margin-left: 50vw;
    }
}
</style>
