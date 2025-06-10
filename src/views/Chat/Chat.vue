<script setup>
import Layout from '../shared/Layout.vue';
import { useTextareaAutosize } from '@vueuse/core'
import Textarea from './components/Textarea.vue';
import RecentChats from './components/RecentChats.vue';
const { textarea, input } = useTextareaAutosize()



</script>
<template>
 
        <Layout>
            <div class="page-wrapper">
                <div class="page-content">
                    <div class="chat-wrapper">
                        <div class="chat-sidebar">
                            <div class="chat-sidebar-header">
                                <div class="d-flex align-items-center">
                                    <div class="chat-user-online">
                                        <img src="/src/assets/images/avatars/avatar-1.png" width="45" height="45" class="rounded-circle" alt="" />
                                    </div>
                                    <div class="flex-grow-1 ms-2">
                                        <p class="mb-0">Rachel Zane</p>
                                    </div>
                                    <div class="dropdown">
                                        <div class="cursor-pointer font-24 dropdown-toggle dropdown-toggle-nocaret" data-bs-toggle="dropdown"><i class='bx bx-dots-horizontal-rounded'></i>
                                        </div>
                                        <div class="dropdown-menu dropdown-menu-end"> <a class="dropdown-item" href="javascript:;">Settings</a>
                                            <div class="dropdown-divider"></div>	<a class="dropdown-item" href="javascript:;">Help & Feedback</a>
                                            <a class="dropdown-item" href="javascript:;">Enable Split View Mode</a>
                                            <a class="dropdown-item" href="javascript:;">Keyboard Shortcuts</a>
                                            <div class="dropdown-divider"></div>	<a class="dropdown-item" href="javascript:;">Sign Out</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3"></div>
                                <div class="input-group input-group-sm"> <span class="input-group-text bg-transparent"><i class='bx bx-search'></i></span>
                                    <input type="text" class="form-control" placeholder="People, groups, & messages"> <span class="input-group-text bg-transparent"><i class='bx bx-dialpad'></i></span>
                                </div>
                                <div class="chat-tab-menu mt-3">
                                    <ul class="nav nav-pills nav-justified">
                                        <li class="nav-item">
                                            <a class="nav-link active" data-bs-toggle="pill" href="javascript:;">
                                                <div class="font-24"><i class='bx bx-conversation'></i>
                                                </div>
                                                <div><small>Chats</small>
                                                </div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="javascript:;">
                                                <div class="font-24"><i class='bx bx-phone'></i>
                                                </div>
                                                <div><small>Calls</small>
                                                </div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="javascript:;">
                                                <div class="font-24"><i class='bx bxs-contact'></i>
                                                </div>
                                                <div><small>Contacts</small>
                                                </div>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="javascript:;">
                                                <div class="font-24"><i class='bx bx-bell'></i>
                                                </div>
                                                <div><small>Notifications</small>
                                                </div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="chat-sidebar-content">
                                <div class="tab-content" id="pills-tabContent">
                                    <div class="tab-pane fade show active" id="pills-Chats">
                                        <div class="p-3">
                                            <div class="meeting-button d-flex justify-content-between">
                                                <div class="dropdown"> <a href="#" class="btn btn-white btn-sm radius-30 dropdown-toggle dropdown-toggle-nocaret maz-gradient-btn" data-bs-toggle="dropdown"><i class='bx bx-video me-2'></i>Meet Now<i class='bx bxs-chevron-down ms-2'></i></a>
                                                    <div class="dropdown-menu"> <a class="dropdown-item" href="#">Host a meeting</a>
                                                        <a class="dropdown-item" href="#">Join a meeting</a>
                                                    </div>
                                                </div>
                                                <div class="dropdown"> <a href="#" class="btn btn-white btn-sm radius-30 dropdown-toggle dropdown-toggle-nocaret maz-gradient-btn" data-bs-toggle="dropdown" data-display="static"><i class='bx bxs-edit me-2'></i>New Chat<i class='bx bxs-chevron-down ms-2'></i></a>
                                                    <div class="dropdown-menu dropdown-menu-right">	<a class="dropdown-item" href="#">New Group Chat</a>
                                                        <a class="dropdown-item" href="#">New Moderated Group</a>
                                                        <a class="dropdown-item" href="#">New Chat</a>
                                                        <a class="dropdown-item" href="#">New Private Conversation</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="dropdown mt-3"> <a href="#" class="text-uppercase text-secondary dropdown-toggle dropdown-toggle-nocaret" data-bs-toggle="dropdown">Recent Chats <i class='bx bxs-chevron-down'></i></a>
                                                <div class="dropdown-menu">	<a class="dropdown-item" href="#">Recent Chats</a>
                                                    <a class="dropdown-item" href="#">Hidden Chats</a>
                                                    <div class="dropdown-divider"></div>	<a class="dropdown-item" href="#">Sort by Time</a>
                                                    <a class="dropdown-item" href="#">Sort by Unread</a>
                                                    <div class="dropdown-divider"></div>	<a class="dropdown-item" href="#">Show Favorites</a>
                                                </div>
                                            </div>
                                        </div>
                                        <RecentChats/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chat-header d-flex align-items-center">
                            <div class="chat-toggle-btn"><i class='bx bx-menu-alt-left'></i>
                            </div>
                            <div>
                                <h4 class="mb-1 font-weight-bold">Harvey Inspector</h4>
                                <div class="list-inline d-sm-flex mb-0 d-none"> <a href="javascript:;" class="list-inline-item d-flex align-items-center text-secondary"><small class='bx bxs-circle me-1 chart-online'></small>Active Now</a>
                                    <a href="javascript:;" class="list-inline-item d-flex align-items-center text-secondary">|</a>
                                    <a href="javascript:;" class="list-inline-item d-flex align-items-center text-secondary"><i class='bx bx-images me-1'></i>Gallery</a>
                                    <a href="javascript:;" class="list-inline-item d-flex align-items-center text-secondary">|</a>
                                    <a href="javascript:;" class="list-inline-item d-flex align-items-center text-secondary"><i class='bx bx-search me-1'></i>Find</a>
                                </div>
                            </div>
                            <div class="chat-top-header-menu ms-auto"> <a href="javascript:;"><i class='bx bx-video'></i></a>
                                <a href="javascript:;"><i class='bx bx-phone'></i></a>
                                <a href="javascript:;"><i class='bx bx-user-plus'></i></a>
                            </div>
                        </div>
                        <div class="chat-content">
                            <div class="chat-content-leftside">
                                <div class="d-flex">
                                    <img src="/src/assets/images/avatars/avatar-3.png" width="48" height="48" class="rounded-circle" alt="" />
                                    <div class="flex-grow-1 ms-2">
                                        <p class="mb-0 chat-time">Harvey, 2:35 PM</p>
                                        <p class="chat-left-msg">Hi, harvey where are you now a days?</p>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-content-rightside">
                                <div class="d-flex ms-auto">
                                    <div class="flex-grow-1 me-2">
                                        <p class="mb-0 chat-time text-end">you, 2:37 PM</p>
                                        <p class="chat-right-msg">I am in USA</p>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-content-leftside">
                                <div class="d-flex">
                                    <img src="/src/assets/images/avatars/avatar-3.png" width="48" height="48" class="rounded-circle" alt="" />
                                    <div class="flex-grow-1 ms-2">
                                        <p class="mb-0 chat-time">Harvey, 2:48 PM</p>
                                        <p class="chat-left-msg">okk, what about admin template?</p>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-content-rightside">
                                <div class="d-flex">
                                    <div class="flex-grow-1 me-2">
                                        <p class="mb-0 chat-time text-end">you, 2:49 PM</p>
                                        <p class="chat-right-msg">i have already purchased the admin template</p>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-content-leftside">
                                <div class="d-flex">
                                    <img src="/src/assets/images/avatars/avatar-3.png" width="48" height="48" class="rounded-circle" alt="" />
                                    <div class="flex-grow-1 ms-2">
                                        <p class="mb-0 chat-time">Harvey, 3:12 PM</p>
                                        <p class="chat-left-msg">ohhk, great, which admin template you have purchased?</p>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-content-rightside">
                                <div class="d-flex">
                                    <div class="flex-grow-1 me-2">
                                        <p class="mb-0 chat-time text-end">you, 3:14 PM</p>
                                        <p class="chat-right-msg">i purchased dashtreme admin template from themeforest. it is very good product for web application</p>
                                    </div>
                                </div>
                            </div>
                          
                          
                        </div>

                        <Textarea/>


                        <!--start chat overlay-->
                        <div class="overlay chat-toggle-btn-mobile"></div>
                        <!--end chat overlay-->
                    </div>
                </div>
            </div>
        </Layout>
		

	
</template>
<style>
.chat-list {
    overflow-y: scroll;
    scrollbar-width: thin;
}
.chat-content {
    overflow-y: scroll;
    scrollbar-width: thin;
}
textarea {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  textarea::-webkit-scrollbar {
    display: none;
  }
</style>