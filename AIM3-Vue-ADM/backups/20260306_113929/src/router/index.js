import { createRouter, createWebHistory } from 'vue-router'
import MainDashboard from '../views/MainDashboard.vue'
import PublicAssetView from '../views/PublicAssetView.vue'
import AmasOS from '../components/AmasOS.vue'
import OkePage from '../components/OkePage.vue'
import DeploymentDashboard from '../components/DeploymentDashboard.vue'

const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: MainDashboard
    },
    {
        path: '/f/:hash',
        name: 'asset',
        component: PublicAssetView
    },
    {
        path: '/os',
        name: 'amas-os',
        component: AmasOS
    },
    {
        path: '/oke',
        name: 'oke-page',
        component: OkePage
    },
    {
        path: '/deployment',
        name: 'deployment-dashboard',
        component: DeploymentDashboard
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
