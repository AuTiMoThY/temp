const TwBtn = {
    props: {
        href: String,
    },
    template: `
        <a v-if="href" :href="href" class="tw_btn">
            <span class="tw_btn-inner">
                <slot></slot>
            </span>
        </a>
        <button class="tw_btn" v-else>
            <span class="tw_btn-inner">
                <slot></slot>
            </span>
        </button>
    `,
};
