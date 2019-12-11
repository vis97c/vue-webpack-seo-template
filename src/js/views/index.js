import Vue from 'vue';
import VueRouter from 'vue-router';

// import Home from './_home.vue'
// import GetStarted from './_get_started.vue'
// // import Contact from './_contact.vue'
// import NotFound from './_not_found.vue'

Vue.use(VueRouter)

// lazyload
function loadView(view) {
    return () => import(/* webpackChunkName: "view-[request]" */ `_src/js/views/${view}.vue`)
}
// loadView('_vista')

const views = new VueRouter({
    linkActiveClass: "active",
    mode: "history",
    routes: [
        {
            path: '/',
            name: 'Home',
            component: loadView('_home'),
            meta: {
                title: '_blank | Home'
            }
        },
        {
            path: '/get_started',
            name: 'GetStarted',
            component: loadView('_get_started'),
            meta: {
                title: '_blank | Get Started'
            }
        },
        // {
        //     path: '/contact',
        //     component: loadView('_contac')t
        // },
        {
            path: '*',
            redirect: '/404'
        },
        {
            path: '/404',
            name: '404',
            component: loadView('_not_found'),
            meta: {
                title: '_blank | 404'
            }
        },
    ],
    mode: 'history',
    linkActiveClass: 'active-link',
    linkExactActiveClass: 'exact-active-link',
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { x: 0, y: 0 };
        }
    },
});
views.beforeEach((to, from, next) => {
    /* It will change the title when the router is change*/
    document.title = to.meta.title ? to.meta.title : initialState.meta.title; // resets and defaults to stored title if it doesn't have one

    // Metatags for the rendering engine
    if (window.__PRERENDER_INJECTED) {
        // facebook og:title support
        if (!!document.querySelector("meta[property='og:title']")) {
            // setter
            document.querySelector("meta[property='og:title']").setAttribute('content', document.title);
        } else {
            // tag doesn't exist, create one
            document.head.appendChild(
                document.createElement('meta').setAttribute('property', 'og:title').setAttribute('content', document.title)
            );
        }
        // twitter:title support
        if (!!document.querySelector("meta[name='twitter:title']")) {
            // setter
            document.querySelector("meta[name='twitter:title']").setAttribute('content', document.title);
        } else {
            // tag doesn't exist, create one
            document.head.appendChild(
                document.createElement('meta').setAttribute('name', 'twitter:title').setAttribute('content', document.title)
            );
        }


        /* It will change the description when the router is change*/
        var description = to.meta.description ? to.meta.description : initialState.meta.description; // resets and defaults to stored description if it doesn't have one
        // description support
        if (!!document.querySelector("meta[name='description']")) {
            // setter
            document.querySelector("meta[name='description']").setAttribute('content', description);
        } else {
            // tag doesn't exist, create one
            document.head.appendChild(
                document.createElement('meta').setAttribute('name', 'description').setAttribute('content', description)
            );
        }
        // facebook og:description support
        if (!!document.querySelector("meta[property='og:description']")) {
            // setter
            document.querySelector("meta[property='og:description']").setAttribute('content', description);
        } else {
            // tag doesn't exist, create one
            document.head.appendChild(
                document.createElement('meta').setAttribute('property', 'og:description').setAttribute('content', description)
            );
        }
        // twitter:description support
        if (!!document.querySelector("meta[name='twitter:description']")) {
            // setter
            document.querySelector("meta[name='twitter:description']").setAttribute('content', description);
        } else {
            // tag doesn't exist, create one
            document.head.appendChild(
                document.createElement('meta').setAttribute('name', 'twitter:description').setAttribute('content', description)
            );
        }

        /* It will change tags when the router is change*/
        var tags = to.meta.tags ? to.meta.tags : initialState.meta.tags; // resets and defaults to stored description if it doesn't have one
        if (!!document.querySelector("meta[name='keywords']")) {
            // setter
            document.querySelector("meta[name='keywords']").setAttribute('content', tags);
        } else {
            // tag doesn't exist, create one
            document.head.appendChild(
                document.createElement('meta').setAttribute('name', 'keywords').setAttribute('content', tags)
            );
        }

        /* It will change canonicals urls when the router is change*/
        var canonical = 'https://www.' + initialState.host + to.fullPath.split('?')[0];
        // canonical url support
        if (!!document.querySelector("link[rel='canonical']")) {
            // setter
            document.querySelector("link[rel='canonical']").setAttribute('href', canonical);
        } else {
            // tag doesn't exist, create one
            document.head.appendChild(
                document.createElement('link').setAttribute('rel', 'canonical').setAttribute('href', canonical)
            );
        }
        // facebook og:url support
        if (!!document.querySelector("meta[property='og:url']")) {
            // setter
            document.querySelector("meta[property='og:url']").setAttribute('content', canonical);
        } else {
            // tag doesn't exist, create one
            document.head.appendChild(
                document.createElement('meta').setAttribute('property', 'og:url').setAttribute('content', canonical)
            );
        }
    }

    next();
});
export default views;