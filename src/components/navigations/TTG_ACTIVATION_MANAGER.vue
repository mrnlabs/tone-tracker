<script setup>

import { useOnline } from '@vueuse/core'
import { ref } from 'vue';
import { useRoute } from 'vue-router';

//////////active///////////
const isExpanded = ref(false);
const activeItem = ref('');

const currentRoute = useRoute();
console.log(currentRoute.path);

const setActiveItem = (item) => {
  activeItem.value = item;
};
///////////active//////////

const online = useOnline()

const isOnline = online;
const props = defineProps({
    user: Object
});

const getRoleName = () => {
    return props.user.role == 'TTG_ACTIVATION_MANAGER' ? 'Activations Manager' : ''
}
</script>
<template>
    <div class="side-nav-wrapper">
        <div class="accordion" id="accordionPanelsStayOpenExample">
            <div class="side-nav">
                <div class="accordion-item">
                    <div class="accordion-header profile">
                        <button class="d-flex align-items-center justify-content-between accordion-button" type="button"
                            data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true"
                            aria-controls="panelsStayOpen-collapseOne">
                            <div class="profile-info">
                                <span class="name">{{user.firstName}} {{user.lastName}}</span>
                                <span class="status">
                                    <span class="round-guest" :class="{'online': isOnline, 'offline': !isOnline}"></span>
                                    {{ getRoleName() }}
                                </span>
                            </div>
                            <span class="edit-profile">
                                <button class="edit-profile-btn">
                                    <i class='bx bx-edit-alt'></i>
                                </button>
                            </span>
                        </button>
                    </div>

                    <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show"
                        data-bs-parent="#accordionExample">
                        <div class="accordion-body p-0">
                            <ul class="nav-list">
                                <li :class="{ 'active': currentRoute.path === '/activations' }"><router-link to="/activations"><i class='bx bx-chat ps-3 pe-3'></i> Map</router-link></li>
                                <li :class="{ 'active': currentRoute.path === '/admin-activations' }"><router-link to="/admin-activations">
                                    <i class='bx bx-calendar-event ps-3 pe-3'></i> Activations</router-link></li>
                                <li :class="{ 'active': currentRoute.path === '/promoters' }"><router-link to="/promoters"><i class='bx bx-group ps-3 pe-3'></i> Promoters</router-link></li>
                                <li :class="{ 'active': currentRoute.path === '/suppliers' }"><router-link to="/suppliers"><span class="icon"><i class='bx bxs-user-detail ps-3'></i></span>Suppliers</router-link></li>
                                <li :class="{ 'active': currentRoute.path === '/briefs' }"><router-link to="/briefs"><i class='bx bx-file ps-3 pe-3'></i> Briefs</router-link></li>
                                <li :class="{ 'active': currentRoute.path === '/teaching' }"><router-link to="/teaching"><i class='bx bx-book-open ps-3 pe-3'></i> Learning & Teaching</router-link></li>
                                <!-- <li :class="{ 'active': currentRoute.path === '/jobs' }"><router-link to="/jobs"><i class='bx bx-briefcase ps-3 pe-3'></i> Jobs</router-link></li> -->
                                <li :class="{ 'active': currentRoute.path === '/regions'}"><router-link to="/regions"><span class="icon"><i class='bx bx-map ps-3'></i></span> Warehousing</router-link></li>
                                <li :class="{ 'active': currentRoute.path === '/crm'}"><router-link to="/crm"><span class="icon"><i class='bx bx-briefcase ps-3'></i></span> CRM</router-link></li>
                                <!-- <li><router-link to="/jobs"><span class="icon"><i class='bx bx-file'></i></span> Jobs</router-link></li> -->
                                <li :class="{ 'active': currentRoute.path === '/upload' }" ><router-link to="/upload"><span class="icon"><i class='bx bx-upload ps-3'></i></span> Upload contract</router-link></li>
                            </ul>

                        </div>
                    </div>
                </div>
                <div class="accordion-item d-none">
                    <h2 class="accordion-header">
                        <button class="d-flex gap-2 justify-content-end flex-row-reverse accordion-button w-0 collapsed "
                            type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo"
                            aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                            Show more
                        </button>
                    </h2>
                    <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <div class="sidebar">
                                <div class="menu-section">
                                    <h3>Projects</h3>
                                    <ul>
                                        <li># Joburg Activations</li>
                                        <li># Durban Activations</li>
                                        <li># Cape Town Activations</li>
                                    </ul>
                                </div>
                                <div class="menu-section">
                                    <h3>Channels</h3>
                                    <ul>
                                        <li># Marketing-team</li>
                                        <li># Competitive</li>
                                        <li># Announcements</li>
                                        <li># Quarterly planning</li>
                                    </ul>
                                </div>
                                <div class="menu-section">
                                    <h3>Direct Messages</h3>
                                    <ul>
                                        <li class="active">• Guest (You)</li>
                                        <li>• Brandley Thomas</li>
                                        <li>• Michael John</li>
                                    </ul>
                                </div>
                                <div class="menu-section">
                                    <h3>Communities</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SideNav',
};
</script>

<style scoped>
.profile .accordion-button::after {
    /* margin-bottom: 10px; */
}

.accordion-button::after {
    margin: 0 !important;
}

.side-nav {
    width: 240px;
    background-color: #000;
    color: #fff;
    /* padding: 20px; */
    /* font-family: Arial, sans-serif; */
}

.profile {
    /* padding: 20px; */
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.profile-info {
    display: flex;
    flex-direction: column;
}

.name {
    font-size: 18px;
    font-weight: bold;
}

.round-guest {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 7px;
}
.online{
    background-color: #15ca20 !important
}
.offline{
    background-color: #fd3550!important
}

.status {
    font-size: 14px;
}

.edit-profile-btn {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
}

.nav-list {
    list-style: none;
    padding: 0;
}

.nav-list li {
    /* margin: 15px 0; */
}

.nav-list a {
    color: #fff;
    text-decoration: none;
    display: flex;
    align-items: center;
}

.nav-list .icon {
    margin-right: 10px;
}

.nav-list a:hover {
    /* text-decoration: underline; */
    background-color: #1f1e1e
}

/* //////////////////// */
.menu-section {
    margin-bottom: 20px;
}

.menu-section h3 {
    padding-left: 20px;
    font-size: 1.2em;
    margin-bottom: 10px;
    color: #ccc;
}

.menu-section ul {
    list-style: none;
    padding: 0 25px;
}

.menu-section ul li {
    padding: 0, 10px;
    font-size: 1em;
    color: #bbb;
}


/* color: #b06fcd; */


.menu-section ul li:hover {
    color: #fff;
}

.nav-list i {
    font-size: 1.5rem; /* Adjust this value as needed */
}

/* //////////////////// */

/* header section */
.accordion-header.profile {
    background-color: #1e1e1e;
}

.accordion-button {
    background-color: transparent;
    box-shadow: none;
    padding: 10px 15px;
    width: 100% !important;
    
}

.accordion-button::after {
    display: none;
}

.profile-info {
    display: flex;
    flex-direction: column;
}

.name {
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
}

.status {
    font-size: 12px;
    color: #a0a0a0;
    display: flex;
    align-items: center;
}

.round-guest {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
}

.online {
    background-color: #ff3b30;
}

.offline {
    background-color: #a0a0a0;
}

.edit-profile-btn {
    background: none;
    border: none;
    color: #a0a0a0;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
}

.edit-profile-btn:hover {
    color: #ffffff;
}
.accordion-button:not(.collapsed) {
    margin-bottom: 0px;
}

/* /////////////////// */
.side-nav-wrapper {
  height: 100vh; /* Full viewport height */
  overflow-y: auto; /* Enable vertical scrolling */
}

.side-nav {
  width: 240px;
  background-color: #000;
  color: #fff;
  /* Remove any fixed height if present */
}

/* Add some padding to the bottom to ensure last items are visible when scrolled */
.accordion-item:last-child {
  padding-bottom: 20px;
}

/* Optional: Customize the scrollbar */
.side-nav-wrapper::-webkit-scrollbar {
  width: 6px;
}

.side-nav-wrapper::-webkit-scrollbar-thumb {
  background-color: #4a4a4a;
  border-radius: 3px;
}

.side-nav-wrapper::-webkit-scrollbar-track {
  background-color: #1e1e1e;
}

/* ////////Active////////// */
.side-nav__item.active,
.side-nav__item:hover {
  background-color: #333333 !important; /* Adjust this color to match your hover color */
}

.active{
    background-color: #333333 !important; /* Adjust this color to match your hover color */
}
  


</style>