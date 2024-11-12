import { createApp } from 'vue'
import './style.css'
import App from './App.vue' 


const app = createApp(App)
const componentRegistry = [];
Object.entries(import.meta.glob('@/components/DesignEditor/components/elements/**/*.vue', { eager: true })).forEach(([path, definition]) => {
    const originalName = path.split('/').pop().replace(/\.\w+$/, ''); 
    // OriginalName => SidebarItem
    if (componentRegistry.indexOf(originalName) === -1) {
        app.component(originalName, definition.default);
    } 
    console.log(originalName);
    // dd(originalName, kebabCaseName, suffixName);
    componentRegistry.push(originalName);
});

import ProfileCard from './components/ProfileCard.vue';

app.component('ProfileCard', ProfileCard);

app.mount('#app')
