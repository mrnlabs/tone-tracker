/**
Author: Mazisi Msebele
Date: 04/06/2024
**/

<template>
    <Layout>
        <!--start page wrapper -->
        <div class="page-wrapper">
            <div class="page-content">

                <!-- <BreadCrumb title="Profile" icon="bx bx-user-circle" /> -->
                <div class="page-breadcrumb d-none d-sm-flex align-items-center mb-1">
					<div class="ps-3">
                        <div class="main-dashboard-head">
                            <BreadCrumb title="Profile" icon="bx bxs-user"/>
                        </div>
                        <!-- <p class="text-white">Promoter</p> -->
					</div>
					<!-- <div class="ms-auto">
						<div class="btn-group">
							
						</div>
					</div> -->
				</div>
                
              

                <div class="container-fluid">
                    <div class="row justify-content-between">
                        <div class="col-xl-3 col-lg-6 col-sm-12">
                            <div class="card-c">
                                <div class="d-flex flex-column card-header-c">
                                    <div class="image-container">
                                        <div class="card flex justify-center">
                                            <Image alt="Image" preview>
                                                <template #previewicon>
                                                <i class='bx bx-search-alt-2' ></i>
                                                </template>
                                                <template #image>
                                                    <img v-if="path == null" 
                                                        :src="userInfo?.path ? envPath + userInfo?.path : 'https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png'" 
                                                        alt="image" width="350"  style="max-width: 17rem" />
                                                    <img v-else :src="path" alt="image" width="350" />
                                                    </template>

                                                    <template #preview="slotProps">
                                                    <img :src="userInfo.path ? envPath + userInfo.path : 'https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png'" 
                                                        alt="preview" :style="slotProps.style" @click="slotProps.onClick" />
                                                    </template>

                                            </Image>
                                            </div>
                                        <div v-if="canUpdate()" 
                                            class="edit-icon" @click="showProfilePictuteModal = true">
                                            <i class='bx bx-edit-alt fs-2'></i>
                                        </div>
                                    </div>

                                    <div class="mt-3 mb-4">
                                        <h4 class="text- ">{{ getFullName() }} </h4>
                                        <h4 class="text-center">
                                            <Rating :modelValue="promoterData?.averageRating" :readonly="true" class="mt-2" width="20px"/>
                                        </h4>
                                    </div>

                                </div>
                            

                                <!-- comment -->
                             <div class="maz-gradient-border-top"></div>
                             
                                <Accordion value="0" >
                                    <AccordionPanel value="1">
                                        <AccordionHeader class="pt-0 pb-0">
                                            <h5>Comments</h5>
                                        
                                        </AccordionHeader>
                                        <AccordionContent>

                                            <!-- start comments -->
                                            <div class="chat-content-leftside mt-2">
                                                <div class="d-flex" v-for="rating in promoterData.ratings" :key="rating.id" >
                                                    <img :src="rating.path ? envPath + rating.path : '@/assets/images/avatars/avatar-3.png'" width="48" height="48" class="rounded-circle" alt="">
                                                    <div class="flex-grow-1 ms-2">
                                                        <p class="mb-0 chat-time mb-2 d-flex justify-content-between">
                                                            <Rating v-model="rating.rating" />
                                                            <i @click="deleteComment(rating.id)" class='mt-2 cursor-pointer text-danger fs-5 bx bx-trash'></i>
                                                        </p>
                                                        <p class="chat-left-msg">
                                                            {{ rating.comment }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- end comments -->
                                             <!-- <div class="border "></div> -->
                                            <div class="comment-sectiona border border-3 p-4 rounded mt-3">
                                                
                                                <div class="mb-3 ">
                                                    <div class="mt-3 mb-3 flex justify-center">
                                                    <Rating v-model="commentForm.rating" />
                                                    <p v-if="!commentForm.rating" class="text-danger" style="font-size: .7rem">Please give rate</p>

                                                 
                                                </div>
                                                    <FloatLabel>
                                                        <Textarea class="form-control" 
                                                        v-model="commentForm.comment" autoResize rows="5" cols="30" />
                                                        <label>Write Comment</label>
                                                    </FloatLabel>
                                                    <!-- <p v-if="!commentForm.comment" class="text-danger" style="font-size: .7rem">Please write comment</p> -->
                                                </div>
                                                

                                        <Button v-if="!commentLoading" @click="submitComment" classes="btn w-100 rounded-0 btn-primary maz-gradient-btn" type="button" 
                                            :disabled="false">
                                            <template #content>
                                                <span>Post Comment</span>
                                            </template>									  
                                         </Button>
                                         <div v-else class="text-center">
                                         <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" 
                                         aria-label="Custom ProgressSpinner" />
                                        </div>
                                              </div>
                                        </AccordionContent>
                                    </AccordionPanel>
                                </Accordion>
                             
                            </div>

                            


                        
                        </div>
                        <Column class="col-xl-4 col-lg-6 col-sm-12">
                            <div class="">
                                <div class="">
                                    <Row class="g-2">
                                            <Column classes="col-md-6 col-sm-12">
                                                <InputLabel labelText="First Name" classes="form-label" htmlFor="firstname"/>
                                                <Input v-model="profileForm.firstName" type="text" classes="form-control" id="firstname"/>
                                                <InputError classes="input-errors" :errors="vuelidateError.firstName.$errors" message="First Name is required" />
                                            </Column>

                                            <Column classes="col-md-6 col-sm-12">
                                                <InputLabel labelText="Last name" classes="form-label" htmlFor="lastname"/>
                                                <Input v-model="profileForm.lastName" type="text" classes="form-control" id="lastname"/>
                                                <InputError classes="input-errors" :errors="vuelidateError.lastName.$errors" message="Last Name is required" />
                                            </Column>
                                            <Column classes="col-md-6 col-sm-12">
                                                <InputLabel labelText="Phone Number" classes="form-label" htmlFor="cell"/>
                                                <InputNumber v-model="profileForm.phone" classes="form-control" id="cell" placeholder="" />
                                                <span v-if="phoneValidationError" class="text-danger">Phone Number already exist.</span>
                                                <InputError v-else-if="!phoneValidationError" classes="input-errors" :errors="vuelidateError.phone.$errors" message="Phone Number is required" />
                                              </Column>
                        
                                              <Column classes="col-md-6 col-sm-12">
                                                <InputLabel labelText="Email" classes="form-label" htmlFor="email"/>
                                                <Input v-model="profileForm.email" type="text" classes="form-control" id="email" @blur="isEmailUnique"/>
                                                <span v-if="emailValidationError" class="text-danger">Email already exist.</span>
                                                <InputError v-else-if="!emailValidationError" classes="input-errors" :errors="vuelidateError.email.$errors" message="Email is required" />
                                              </Column>
                                              <Column classes="col-md-12 col-sm-12">
                                                <InputLabel labelText="Bio" classes="form-label" htmlFor="bio"/>
                                                <textarea class="form-control" id="description" rows="3" v-model="profileForm.bio" 
                                                placeholder="Your Bio"></textarea>
                                              </Column>
                                              <Column classes="col-md-6 col-sm-12">
                                                <InputLabel labelText="Height" classes="form-label" htmlFor="height"/>
                                                <InputNumber v-model="profileForm.height" classes="form-control" id="height" placeholder="" />
                                                <!-- <InputError classes="input-errors" :errors="vuelidateError.height.$errors" message="Invalid height" /> -->
                                              </Column>
                                              <Column classes="col-md-6 col-sm-12">
                                                <InputLabel labelText="Gender" classes="form-label" htmlFor="gender"/>
                                                <select v-model="profileForm.gender" class="form-control form-control2" id="gender">
                                                    <option :value="''" disabled :selected="true" >Choose gender...</option>
                                                    <option value="MALE">MALE</option>
                                                    <option value="FEMALE">FEMALE</option>
                                                </select>
                                              </Column>
                                              
                                              <Column classes="col-md-4 col-sm-12">
                                                <InputLabel labelText="Dress Size" classes="form-label" htmlFor="dress_size"/>
                                                <select v-model="profileForm.dressSize" class="form-control form-control2" id="dress_size">
                                                    <option :value="''" disabled :selected="true" >Choose Dress Size...</option>
                                                    <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
                                                </select>
                                              </Column>
                                              <Column classes="col-md-4 col-sm-12">
                                                <InputLabel labelText="Top Size" classes="form-label" htmlFor="top-size"/>
                                                <select v-model="profileForm.topSize" class="form-control form-control2" id="top-size">
                                                    <option :value="''" disabled :selected="true">Choose Top Size...</option>
                                                    <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
                                                </select>
                                              </Column>
                                              <Column classes="col-md-4 col-sm-12">
                                                <InputLabel labelText="Height" classes="form-label" htmlFor="pantsSize"/>
                                                <InputNumber v-model="profileForm.pantsSize" classes="form-control" id="pantsSize" placeholder="" />
                                              </Column>
                                              <div class="ms-auto" v-if="canUpdate()">
                                                <Button @click="updateProfile" classes="w-100 btn maz-gradient-btn" type="button" 
                                                  :disabled="!isClientFormValid()">
                                                  <template #content>
                                                    {{ showProfileLoading ?  '' : 'Update' }}
                                                  </template>									  
                                                  <Spinner v-if="showProfileLoading" class="spinner-border spinner-border-sm" />
                                                </Button>
                                              </div>
                                     </Row>
                                </div>
                            </div>
                        </Column>
                        <div class="col-xl-4 col-lg-12 col-sm-12">
                        <div class=" mb-3">
                            <div class="card-body p-4">
                                <h4 class="mb-2 text-center mt-2">Brand Experience</h4>
                                <div class="row mb-3">
                                    <div v-if="promoterData?.experiences?.length" v-for="experience in promoterData?.experiences" :key="experience?.id" class="row mb-3">
                                        <div>
                                            <h6 class="mb-0">{{ experience?.name }}</h6>
                                            <p>{{ experience?.duration }}</p>
                                            <p>{{ experience?.description }}</p>
                                        </div>
                                    </div>
                                    <div class="text-center text-danger" v-else>No Brand  experience added.</div>
                                </div>
                                <div class="row" v-if="canUpdate()">
                                    <div class="col-12 text-end">
                                        <button @click="showExperienceModal=true" type="button" class="btn maz-gradient-btn">Add Brand Experience</button>
                                    </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="card maz-gradient-border-top mt-4" v-if="canUpdate">
                                            <Accordion :value="['maz']">
                                                <AccordionPanel value="maz">
                                                    <AccordionHeader class="pt-0 pb-0"><h4 class="mb-2 text-center mt-2 fs-5">Change Password</h4></AccordionHeader>
                                                    <AccordionContent>
                                                        <div class="card-body p-4">
                                                        
                                                                <div class="row mb-3 mt-2">
                                                                    <label for="password" class="col-sm-3 col-form-label">New Password</label>
                                                                    <div class="col-sm-9">
                                                                        <div class="position-relative input-icon">
                                                                            <input type="text" class="form-control" id="password" placeholder="New Password" v-model="password">
                                                                            <span class="position-absolute top-50 translate-middle-y"><i class='bx bx-lock-alt'></i></span>
                                                                        </div>
                                                                        <div
                                                                        class="input-errors"
                                                                        v-for="error of vv$.password.$errors"
                                                                        :key="error.$uid">
                                                                        <div class="text-danger">Password is required</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="row mb-3">
                                                                    <label for="password-confirm" class="col-sm-3 col-form-label">Confirm Password</label>
                                                                    <div class="col-sm-9">
                                                                        <div class="position-relative input-icon">
                                                                            <input type="text" class="form-control" id="password-confirm" placeholder="Confirm Password" v-model="confirmPassword">
                                                                            <span class="position-absolute top-50 translate-middle-y"><i class='bx bx-lock-alt'></i></span>
                                                                        </div>
                                                                        <div
                                                                        class="input-errors"
                                                                        v-for="error of vv$.confirmPassword.$errors"
                                                                        :key="error.$uid">
                                                                        <div class="text-danger">Please confirm your password</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="row" v-if="canUpdate()">
                                                                    <label class="col-sm-3 col-form-label"></label>
                                                                    <div class="col-sm-9">
                                                                        <div class="d-md-flex justify-content-center align-items-center d-grid align-items-center gap-3">
                                                                            <button @click="updatePassword" type="button" class="btn maz-gradient-btn w-100 px-4">
                                                                                <div v-if="showPasswordLoading" class="spinner-border text-white " role="status"> <span class="visually-hidden">Loading...</span>
                                                                                </div>
                                                                                {{ showPasswordLoading ?  '' : 'Update Password' }}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                    </AccordionContent>
                                                </AccordionPanel>
                                            </Accordion>                                               
                                            </div>

                                            <div class="card maz-gradient-border-top mt-4" v-if="canUpdate">
                                                <Accordion :value="['bank-details']">
                                                    <AccordionPanel value="bank-details">
                                                        <AccordionHeader class="pt-0 pb-0">
                                                            <h4 class="mb-2 text-center mt-2 fs-5">Bank Details</h4>
                                                        </AccordionHeader>
                                                        <AccordionContent>
                                                            <div class="card-body p-4">
                                                            
                                                                    <div class="row mb-3 mt-2">
                                                                        <div v-if="!promoterData.bankingDetails">
                                                                            <FileUploadGeneric 
                                                                               docId="prof2-file"
                                                                                :showFilePreview="true" 
                                                                                accept="application/pdf" 
                                                                                fileType="pdf" 
                                                                                @fileUploaded="onBankDetailsChange"
                                                                                @fileDropped="onBankDetailsDropped"
                                                                                />
                                                                        <div class="ms-auto mt-6">
                                                                            <Button @click="uploadBankDetails" classes="w-100 btn maz-gradient-btn" type="button" 
                                                                              :disabled="false">
                                                                              <template #content>
                                                                              {{ bankDetailsLoading ? '' : 'Submit' }}
                                                                              </template>									  
                                                                              <Spinner v-if="bankDetailsLoading" class="spinner-border spinner-border-sm" />
                                                                            </Button>
                                                                          </div>
                                                                        </div>

                                                                          <div v-if="promoterData.bankingDetails" class="file-details mt-3 p-1 border rounded d-flex align-items-center">
                                                                            <div class="file-icon me-3">
                                                                              <img @click="preview_bank_details_visible = true" 
                                                                              src="/src/assets/images/pdf.png" 
                                                                              alt="" class="img-fluid cursor-pointer" style=" width: 100px; height: 100px; border-radius: 6px;"/>
                                                                            </div>
                                                                            <div class="ms-auto">
                                                                              <span class="cursor-pointer" @click="deleteBankingFile">
                                                                                  <i class='bx bx-trash fs-3 text-danger' ></i>
                                                                              </span>
                                                                            </div>
                                                                          </div>

                                                                    </div>
                                                                </div>
                                                        </AccordionContent>
                                                    </AccordionPanel>
                                                </Accordion>                                               
                                                </div>
                        </div>

                        <div class="col-xl-12 col-lg-12 col-sm-12">

                            <div class="maz-gradient-border-top mt-3"></div>
                                <Accordion value="0" >
                                    <AccordionPanel value="1">
                                        <AccordionHeader class="pt-0 pb-0">
                                            <h5>Promoter Images</h5>
                                        
                                        </AccordionHeader>
                                        <AccordionContent>
                                            <div class="profile-imgs mb-4">
                                                <div class="image-gallery">
                                                    <div v-if="images?.length > 0" class="image-flex-container">
                                                        <div v-for="image in images" :key="image.id" class="image-item">
                                                            <div class="card flex justify-center">
                                                                <Image alt="Image" preview>
                                                                    <template #previewicon>
                                                                        <i class='bx bx-search-alt-2'></i>
                                                                    </template>
                                                                    <template #image>
                                                                        <img :src="envPath + image.path" alt="image" />
                                                                    </template>
                                                                    <template #preview="slotProps">
                                                                        <img :src="envPath + image.path" alt="preview" :style="slotProps.style" @click="slotProps.onClick" />
                                                                    </template>
                                                                </Image>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="mb-4">
                                                <button v-if="canUpdate()" 
                                                    @click="showModal = true"
                                                    class="btn rounded-0 w-100 maz-gradient-btn ps-5 pe-5 d-flex justify-content-center align-items-center">
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                            viewBox="0 0 24 24" style="fill: #ffffff;transform: msFilter;">
                                                            <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                                                        </svg>
                                                    </span><span>Upload Images </span>
                                                </button>
        
                                            </div>
                                        </AccordionContent>
                                    </AccordionPanel>
                                </Accordion>

                            
                        </div>

                        <div class="mt-3 col-xl-12">
                            <div class="maz-gradient-border-top mt-2"></div>
                            <Accordion value="0" >
                                <AccordionPanel value="1">
                                    <AccordionHeader class="pt-0 pb-0">
                                        <h5>Other promoters on job</h5>
                                    
                                    </AccordionHeader>
                                    <AccordionContent>
                                        <div class="prmoters-jobs">
                                            <!-- <h5 class="text-white">Others promoters jobs</h5> -->
                                            <div class="row mt-3  row-cols-xl-9 ">
                                                <div  class="d-flex"> 
                                                    <div v-if="otherPromotersList?.length > 0" v-for="promoter in otherPromotersList" :key="promoter.id">
                                                        <div v-if="isNotSelf(promoter)" class="col-img">
                                                            <div class="gallery">
                                                                <div class="card flex justify-center">
                                                                    <Image alt="Image" preview>
                                                                        <template #previewicon>
                                                                            <i class='bx bx-search-alt-2'></i>
                                                                        </template>
                                                                        <template #image>
                                                                            <img 
                                                                                :src="promoter?.userDetails?.path ? envPath + promoter?.userDetails?.path : 'https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png'"
                                                                                :alt="promoter.userDetails.firstName" 
                                                                                width="250" 
                                                                            />
                                                                        </template>
                                                                        <img src="https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png" alt="">
                                                                        <template #preview="slotProps">
                                                                            <img 
                                                                                :src="promoter?.userDetails?.path ? envPath + promoter?.userDetails?.path : 'https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png'"
                                                                                :alt="promoter.userDetails.firstName" 
                                                                                :style="slotProps.style" 
                                                                                @click="slotProps.onClick" 
                                                                            />
                                                                        </template>
                                                                    </Image>
                                                                </div>
                                                                <div class="desc">{{ promoter.userDetails.firstName + " " + promoter.userDetails.lastName }}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-else class=" text-danger">
                                                        <span class="text-center">No other promoters</span>
                                                        
                                                    </div>
                                                    
                                                </div>
            
                                                <!-- <div
                                                    class="mt-2 text-center cursor-pointer d-flex justify-content-center align-items-center">
                                                    <span>Load More</span>
                                                    <i class='bx bx-chevron-down fs-2'></i>
                                                </div> -->
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionPanel>
                            </Accordion>

                            
                        </div>
                    </div>
                </div>


            </div>
        </div>
        <!-- Add Modal -->
        <Dialog v-model:visible="showModal" position="top" modal header="Add Promoter Images" :style="{ width: '30rem'}">                                   
                                               
            <div class="modal-body">
                <MultipleFileUpload
                :showFilePreview="true" 
                 accept="image/*" 
                 fileType="image" 
                 @fileUploaded="onFileChange"
                 @fileDropped="onMultipleFilesDropped"
                />
            </div>

            <div class="modal-footer">
                <div class="col-12 mt-4">
                    <div class="d-grid mt-3">
                        <button @click="onSubmit" class="btn maz-gradient-btn" type="button" 
                        :disabled="showLoading"> 
                            <span v-if="showLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
        <Dialog v-model:visible="showExperienceModal" header="Add Activation Experience" :style="{ width: '30rem' }" position="top" :modal="true" :draggable="false">
            <form @submit.prevent="addExperience">
            <div class="row g-3">
                  <div class="col-md-12">
                  <label for="name" class="form-label">Name</label>
                 <div class=" flex justify-center">
                    <InputText type="text" v-model="experienceForm.name" class="w-100" />
                 </div>
                  <div class="input-errors" v-for="error of v$.name.$errors" :key="error.$uid">
                    <div class="text-danger">Name is required</div>
                    </div>
                  </div>
                  <div class="col-md-12">
                  <label for="name" class="form-label">Duration</label>
                 <div class=" flex justify-center">
                    <InputText type="text" v-model="experienceForm.duration" class="w-100" placeholder="E.g 2 years"/>
                 </div>
                  <div class="input-errors" v-for="error of v$.duration.$errors" :key="error.$uid">
                    <div class="text-danger">Duration is required</div>
                    </div>
                  </div>
                   <div class="col-md-12">
                  <label for="description" class="form-label">Description</label>
                 <div class=" flex justify-center">
                    <Textarea v-model="experienceForm.description" autoResize rows="5" cols="50" />
                 </div>
                  <div class="input-errors" v-for="error of v$.description.$errors" :key="error.$uid">
                    <div class="text-danger">Description is required</div>
                    </div>
                  </div>
          
                </div> 
            <div class="flex justify-end gap-2" v-if="canUpdate()">
                <div class="text-center mt-2" v-if="brandExpLoading">
                <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" 
                animationDuration=".5s" aria-label="Custom ProgressSpinner" />
            </div>
                <button v-else type="submit" class="btn btn maz-gradient-btn mt-2 w-100">Save</button>
            </div>
            </form>
        </Dialog>
         <Dialog v-model:visible="showProfilePictuteModal" header="Upload Profile Picture" :style="{ width: '30rem' }" position="top" :modal="true" :draggable="false">
         
                                    <div class="modal-body">
                                    <FileUploadGeneric 
                                    docId="profile-file"
                                    :showFilePreview="false" 
                                    accept="image/*" 
                                    fileType="image" 
                                    @fileUploaded="onProfilePicSelect"
                                    @fileDropped="onfileDropped"
                            />
                                    <VuePictureCropper
                                    :boxStyle="{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#f8f8f8',
                                        margin: 'auto',
                                    }"
                                    :img="pic"
                                    :options="{
                                        viewMode: 1,
                                        dragMode: 'move',
                                        aspectRatio: 1,
                                        cropBoxResizable: true,
                                    }"
                                    :presetMode="{
                                        mode: '',
                                        width: 500,
                                        height: 600,
                                    }"
                                    @ready="ready"
                                    class="mt-3"
                                    />
                                    
                                    <div class="tools" v-if="showTools">
                                        <button @click="onCancelCropper" type="button"class="btn" data-bs-dismiss="modal">
                                        Cancel
                                        </button>
                                        <!-- <button class="btn" @click="clear">
                                        Clear
                                        </button> -->
                                        <button class="btn" @click="reset">
                                        Reset
                                        </button>
                                    </div>
                                    </div>

                                            <div class="modal-footer">
                                                <div class="col-12 mt-4">
                                                    <div class="ms-auto">
                                                        <Button @click="getResult" 
                                                        classes="w-100 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0" type="button" :disabled="showLoading">
                                                            <template #content>
                                                            {{ showLoading ? 'Updating...' : 'Update' }}
                                                            </template>									  
                                                            <Spinner v-if="showLoading" class="spinner-border spinner-border-sm" />
                                                          </Button>
                                                    </div>
                                                </div>
                                            </div>
        </Dialog>
        <Drawer v-model:visible="preview_bank_details_visible" position="right" :header="`View Bank Details`" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
            <PDF :src="envPath + promoterData?.bankingDetails" />
        </Drawer>
    </Layout>
</template>
<script setup>
import FloatLabel from 'primevue/floatlabel';
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import Layout from '../shared/Layout.vue';
import { useComments } from '@/stores/comments';
import Rating from 'primevue/rating';
import { onMounted, reactive, ref, watch } from 'vue';
import { usePromoter} from '@/stores/promoter';
import useToaster from '@/composables/useToaster';
import { useRoute } from 'vue-router';
import { useAuth } from '@/stores/auth';
import Image from 'primevue/image';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useVuelidate } from "@vuelidate/core";
import { email, maxValue, minValue, numeric, required, sameAs } from "@vuelidate/validators";
import { useUserStore } from '@/stores/userStore';
import BreadCrumb from '../../components/BreadCrumb.vue';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';
import MultipleFileUpload from '../upload/MultipleFileUpload.vue';
import Button from '@/components/buttons/Button.vue';
import Spinner from '@/components/buttons/Spinner.vue';
import PDF from 'pdf-vue3';
import Drawer from 'primevue/drawer';
import debounce from 'lodash.debounce';
import Input from '@/components/form-components/Input.vue';
import InputError from '@/components/form-components/InputError.vue';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Column from '@/components/general/Column.vue';
import InputNumber from '@/components/form-components/InputNumber.vue';
import Row from '@/components/general/Row.vue';
import ProgressSpinner from 'primevue/progressspinner';



const envPath = import.meta.env.VITE_AWS_S3_BUCKET;
const sizes = ref(["X_SMALL", "SMALL", "MEDIUM", "LARGE", "X_LARGE", "XX_LARGE"]);

onMounted(() => {
    getUser();
    getPromoterDetails();
    getImages();
    if (taskId.value != null) {
        getListOtherPromoters();   
    }
})
const showExperienceModal = ref(false);
const promoterStore = usePromoter();
const authStore = useAuth();
const commentStore = useComments();
const route = useRoute();
const toaster = useToaster();
const userStore = useUserStore();
const files = ref([]);
const promoterId = ref(route.params.id);
const userIdParam = ref(route.params.userId);
const uploaderId = ref(route.query.uploader);
const taskId = ref(route.query.taskId);
const bankDetailsLoading = ref(false);
const commentLoading = ref(false);

const showLoading = ref(false);
const brandExpLoading = ref(false);
const showProfileLoading = ref(false);
const showPasswordLoading = ref(false);
const showProfilePictuteModal = ref(false);

const user = JSON.parse(authStore.user)
const promoterData = ref({});
const otherPromotersList = ref([])
const profilePicName = ref('');
const profilePicPreview = ref(null);
const profilePic = ref(null);
const showTools = ref(false);

//average rating
const averageRating = ref(0);

const password = ref('');
const confirmPassword = ref('');

const paswordRules = {
  password: { required },
  confirmPassword: { sameAs: sameAs(password) }
}
    const vv$ = useVuelidate(paswordRules, { password, confirmPassword });

    const isNotSelf = (user) => {
        return (user.id != userIdParam.value && user.userDetails.id != promoterId.value);
    }

const updatePassword = async () => {
    const isFormCorrect = await vv$.value.$validate();
      if (!isFormCorrect) {
        showPasswordLoading.value = false;
        return;
      }
    showPasswordLoading.value = true;
    userStore.updatePassword(user.id,password.value).then(function (response) {
        showPasswordLoading.value = false;
        toaster.success('Password updated successfully');
        password.value = '';
        confirmPassword.value = '';
        vv$.value.$reset();
        vv$.$errors = [];
    }).catch(function (error) {
        showPasswordLoading.value = false;
        toaster.error('Something went wrong')
        console.log(error)
    }).finally(() => {
        showPasswordLoading.value = false
    })
}

const onFileChange = (filesArr) => {
  files.value = filesArr
}

const experienceForm = reactive({
    promoter: userIdParam.value,
    name: null,
	duration: null,
	description: null,
});

const rules = { 
	name: { required },
	duration: { required },
	description: { required },
};
const v$ = useVuelidate(rules, experienceForm);

const addExperience = async () => {
    const isFormValid = await v$.value.$validate();
	if (!isFormValid) {return;}
    brandExpLoading.value = true;
    promoterStore.addExperience(experienceForm).then(function (response) {
        experienceForm.name = '';
        experienceForm.duration = '';
        experienceForm.description = '';
        v$.value.$errors = [];
        v$.value.$reset();
        getPromoterDetails();
        toaster.success('Experience added successfully')
        brandExpLoading.value = false;

        showExperienceModal.value = false
    }).catch(function (error) {
        brandExpLoading.value = false;
        toaster.error('Something went wrong')
        console.log(error)
    })
}

const myBio = ref(promoterData.value.bio ? promoterData.value.bio : '');
console.log('myBio',promoterData.value)



const updateProfile = () => {
    showProfileLoading.value = true;
    userStore.updateProfile(isMyProfile() ? user.id : promoterId.value,profileForm.value).then(function (response) {
        getUser();
        getPromoterDetails();
        showProfileLoading.value = false;
        toaster.success('Profile updated successfully')
    }).catch(function (error) {
        showProfileLoading.value = false;
        toaster.error('Something went wrong')
        console.log(error)
    }).finally(() => {
        showProfileLoading.value = false
    })
}


const commentForm = reactive({
    rating: null,
    comment: null,
    user: user.id,
    promoter: parseInt(userIdParam.value, 10),
});

const pic = ref('');
const uploadInput = ref(null)
    const result = reactive({
      dataURL: '',
      blobURL: '',
    })

    const submitComment = () => {

        
        
        if( !commentForm.rating || !commentForm.user || !commentForm.promoter) return
        commentLoading.value = true;
        commentStore.submitComment(commentForm).then(function (response) {
        const newComment = {
                ...commentForm,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                id: response.data.id,
                path: response.data.path
        };
        commentForm.rating = null;
        commentLoading.value = false;
        
        // Push the new comment object to the ratings array
        promoterData.value.ratings.push(newComment);
            toaster.success("Comment submitted successfully");
            commentForm.comment = '';
        }).catch(function (error) {
            commentLoading.value = false;
            toaster.error("Error submitting comment");
        console.log(error);
        })
    }

  

    const deleteComment = (id) => {
        if(!confirm('Are you sure you want to delete this comment?')) return
        commentStore.deleteComment(id).then(function (response) {
            //remove the comment from the ratings array
            promoterData.value.ratings = promoterData.value.ratings.filter(comment => comment.id !== id);
            toaster.success("Comment deleted successfully");
        }).catch(function (error) {
            toaster.error("Error deleting comment");
        console.log(error);
        })
    }

    const onfileDropped = (dropedFile) => {
       onProfilePicSelect(dropedFile[0]);
    };

    const onMultipleFilesDropped = (e) => {
        console.log('e', e);
        files.value = e
    };

    const onCancelCropper = () => {
        showModal.value = false;
        pic.value = ''
        result.dataURL = ''
        result.blobURL = ''
    }


const onProfilePicSelect = (event) => {

      // Reset last selection and results
      pic.value = ''
      result.dataURL = ''
      result.blobURL = ''

      
      const files = event;

      if (!files) return

      // Convert to dataURL and pass to the cropper component
      const file = files
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Update the picture source of the `img` prop
        pic.value = String(reader.result)

        // Show the modal
        showTools.value = true

        // Clear selected files of input element
        if (!uploadInput.value) return
        uploadInput.value.value = ''
      }

    //const file = event.target.files[0];
    
    if (file) {
        profilePicName.value = file.name;
        profilePicPreview.value = URL.createObjectURL(file);
    }
    profilePic.value = file;
};

async function getResult() {
      if (!cropper) return
      const base64 = cropper.getDataURL()
      const blob = await cropper.getBlob()
      if (!blob) return

      const file = await cropper.getFile({
        fileName: `${userInfo.value.firstName}_${userInfo.value.lastName}`
      })
      result.dataURL = base64
      result.blobURL = URL.createObjectURL(blob)
      const formData = new FormData();
        formData.append('profilePicture',  file);
        const config = {
        useMultipartFormData: true 
        };
        showLoading.value = true

        promoterStore.uploadSingleImage(isMyProfile.value ? user.id : promoterId.value,formData, config).then(function (response) {
            console.log(response);
            getUser();
            toaster.success("Profile picture updated successfully");
            showLoading.value = false;
            showProfilePictuteModal.value = false
        }).catch(function (error) {
            toaster.error("Error updating profile picture");
            console.log(error);
        }).finally(() => {
            showLoading.value = false
        })

    }

    /**
     * Clear the crop box
     */
    function clear() {
      if (!cropper) return
      cropper.clear()
    }

    /**
     * Reset the default cropping area
     */
    function reset() {
      if (!cropper) return
      cropper.reset()
    }

    /**
     * The ready event passed to Cropper.js
     */
    function ready() {
      console.log('Cropper is ready.')
    }

const userInfo = ref(null);
const profileForm = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: '',
    topSize: '',
    pantsSize: '',
    dob: '',
    dressSize: '',
    height: '',
    gender: '',
    bio: '',
    promoter: promoterId.value
});
const updateRules = { 
  firstName: { required },
  lastName: { required },
  email: { required, email },
  phone: { required, numeric, maxValue: 10, minValue: 10 },
};
const vuelidateError = useVuelidate(updateRules, profileForm);
const getUser = () => {
    userStore.getUser(promoterId.value).then(function (response) {
        console.log('userInfo',response);
        userInfo.value = response.data;
        myBio.value = response.data.bio;
        Object.assign(profileForm.value, {
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            phone: response.data.phone,
            email: response.data.email,
            role: response.data.role,
            bio: response.data.bio,
        })
  }).catch(function (error) {
    toaster.error("Error fetching profile");
    console.log(error);
  });
}

const getPromoterDetails = () => {
    promoterStore.getTalentByTalentId(userIdParam.value).then(function (response) {
        promoterData.value = response.data;

        let sum = 0;
        const ratings = response.data.ratings;

        if (ratings.length > 0) {
            for (let i = 0; i < ratings.length; i++) {
                sum += ratings[i].rating;
            }
            // Calculate the average rating
            averageRating.value = sum / ratings.length;
            // Set the average rating in the reactive promoterData object
            promoterData.value["averageRating"] = averageRating.value;
        } else {
            // Handle case when there are no ratings
            averageRating.value = 0;
            promoterData.value["averageRating"] = 0;
        }


        Object.assign(profileForm.value, {
            topSize: response.data.topSize,
            pantsSize: response.data.pantsSize,
            dob: response.data.dob,
            dressSize: response.data.dressSize,
            height: response.data.height,
            gender: response.data.gender,
            bio: response.data.bio,
        })
        
        
  }).catch(function (error) {
    toaster.error("Error fetching profile");
    console.log(error);
  });
}


//get other promoters on the job
const getListOtherPromoters = () => {
    promoterStore.getOtherPromotersByTaskId(taskId.value).then(function (response) {
        otherPromotersList.value = response.data.content;
        console.log("test", response);
  }).catch(function (error) {
    toaster.error("Error in fetching other promoters");
    
  });
}


const canUpdate = () => {
    // path: `/profile/${promoter.userDetails?.id}/${promoter?.id}`
    // path: '/profile/:id/:userId',
    return (userIdParam.value == user.activeUserId  && user?.id == promoterId.value)
    || (user.role == 'TTG_SUPER_ADMIN' || user.role == 'TTG_HEAD_ADMIN' || user.role == 'TTG_REGIONAL_MANAGER' || user.role == 'TTG_ACTIVATION_MANAGER');
}


const getFullName = () => {
    if(!userInfo.value) {
        return '';
    }
    return `${userInfo.value.firstName} ${userInfo.value.lastName}`
}

const isMyProfile = () => {
    return (userIdParam.value == user.activeUserId  && user?.id == promoterId.value)
}

let showModal = ref(false);
const onSubmit = () => {
    if(!files.value.length){
      toaster.error("Please select at least one image");
      return
    }
    showLoading.value = true;
    const formData = new FormData();

     let imageFiles = [];

    for (let i = 0; i < files.value.length; i++) {
        // imageFiles.push(files.value[i]);
	  formData.append('imageFiles', files.value[i]);
  }
        formData.append('entity', "promoters");
        formData.append('entityId', isMyProfile() ? user.id : userIdParam.value);//if its admin get promoter id from the url
        formData.append('uploaderId', isMyProfile() ? user.id : uploaderId.value);//if its admin get uploader id from the url
    const config = {
    useMultipartFormData: true // Add this flag to the request config
};
    promoterStore.uploadImages(formData, config).then(function (response) {
        showModal.value = false;
        showLoading.value = false;
        files.value = [];
        getImages();
        toaster.success("Image uploaded successfully");
    }).catch(function (error) {
        toaster.error("Error in uploading image");
        console.log(error);
    }).finally(() => {
        showLoading.value = false;
    })

}
const images = ref([]);
const getImages = async () => {
//     const promoterId = ref(route.params.id);
// const userIdParam = ref(route.params.userId);

    promoterStore.getImages(userIdParam.value, 'promoters', promoterId.value).then(response => {
        console.log('images',response.data)
	images.value = response.data;
  }).catch(error => {
	toaster.error("Error fetching images");
	console.log(error);
  }).finally(() => {
	//
  });
};

const bankDetailFile = ref(null);

const onBankDetailsChange = (fileParam) => {
    bankDetailFile.value= null;
    bankDetailFile.value = fileParam;
}
const onBankDetailsDropped = (dropedFile) => {
    bankDetailFile.value= null;
    bankDetailFile.value = dropedFile[0];
    console.log('dropedFile',dropedFile[0]);
    };



const uploadBankDetails = () => {
    console.log('fileParam',bankDetailFile.value)
    const formData = new FormData();
    formData.append('banking-document', bankDetailFile.value);
    const config = {
      useMultipartFormData: true
    };
    promoterStore.uploadBankDetails(formData, userIdParam.value, config).then(function (response) {
        showModal.value = false;
        showLoading.value = false;
        bankDetailFile.value = null;
        getPromoterDetails();
        toaster.success("Bank details uploaded successfully");
    }).catch(function (error) {
        toaster.error("Error in uploading bank details");
        console.log(error);
    }).finally(() => {
        showLoading.value = false;
    })
}

const deleteBankingFile = () => {
    if(!confirm("Are you sure you want to delete this file?")) return;
    promoterStore.deleteBankingFile(userIdParam.value).then(function (response) {
        getPromoterDetails();
        toaster.success("Bank details deleted successfully");
    }).catch(function (error) {
        toaster.error("Error in deleting bank details");
        console.log(error);
    })
}

const preview_bank_details_visible = ref(false);

const phoneValidationError = ref(false);
const emailValidationError = ref(false);

const isPhoneUnique = debounce(() => {
  userStore.isFieldUnique('phone', profileForm.phone, profileForm.id).then((response) => {
    phoneValidationError.value = response.data === true;
  });
}, 500);


const isEmailUnique = debounce(() => {
  userStore.isFieldUnique('email', profileForm.email,profileForm.id).then((response) => {
    emailValidationError.value = response.data === true;
  });
}, 500);


watch(
  () => profileForm.phone,
  () => {
    if (profileForm.phone) isPhoneUnique();
  }
);

watch(
  () => profileForm.email,
  () => {
    if (profileForm.email) isEmailUnique();
  }
);

// Form validation function
const isClientFormValid = () => {
  return !phoneValidationError.value && !emailValidationError.value || loading.value == true;
};

</script>
<style scoped>
/* //Acordion// */
html.dark-theme .accordion-item {
    /* color: #e4e5e6; */
    background-color: #0F0F0F;
    border: none;
}


div.gallery {
    margin: 5px;
    border: 1px solid #12181A;
    float: left;
    width: 160px;
}

div.gallery:hover {
    border: 1px solid #777;
}

div.gallery img {
    width: 95%;
    height: auto;
}

div.desc {
    padding: 13px;
    text-align: center;
}

.col-img {
    flex: 0 0 0%;
}

.zoom-image {
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    transition: transform 0.3s ease-in-out;
    /* Smooth transition */
}

.image-container:hover .zoom-image {
    transform: scale(1.1);
    /* Zoom in (1.2 = 120%) */
}

.dark-theme .card {
    background-color: transparent !important;
    padding: 0px !important;
}

/* Add some basic styling for the modal */
.modal-content {
    background-color: #1a1a1a;
    color: #ffffff;
}

.modal-header {
    border-bottom: 1px solid #2a2a2a;
}

.modal-footer {
    border-top: 1px solid #2a2a2a;
}

.btn-close {
    color: #ffffff;
}

/* //////////drag and drop///////////////// */
.drag-drop-area {
    border: 2px dashed #5A5959;
    border-radius: 5px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.3s;
}

.drag-drop-area:hover,
.drag-drop-area.drag-over {
    background-color: #2a2a2a;
}

.drag-drop-text {
    color: #5A5959;
}

#fileList {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.file-item {
    background-color: #2a2a2a;
    padding: 5px 10px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.file-item .remove-file {
    cursor: pointer;
    color: #ff6b6b;
}



.comment-section {
    max-width: 700px;
    margin: 2rem auto;
    background-color: #2c2e33;
    padding: 1.5rem;
    border-radius: 10px;
}
.form-control {
    background-color: #1d1f24;
    color: #ced4da;
    border: 1px solid #404348;
}
.form-control:focus {
    background-color: #1d1f24;
    color: #ced4da;
    border-color: #4a9bfc;
    box-shadow: none;
}
.btn-primary {
    background-color: #4a9bfc;
    border-color: #4a9bfc;
}
.comment {
    margin-top: 1.5rem;
}
.comment .user {
    display: flex;
    align-items: center;
}
.comment .user img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 0.75rem;
}
.comment .user-name {
    font-weight: 500;
    color: #fff;
}
.comment .comment-date {
    color: #a9acb0;
    font-size: 0.9rem;
}
.comment .comment-text {
    margin-top: 0.5rem;
    color: #ced4da;
}






.image-container {
    width: 272px;
    position: relative;
    display: inline-block;
}

.edit-icon {
    position: absolute;
    top: -5px;
    right: 1px;
    border-radius: 50%;      
    padding: 5px;  
    cursor: pointer;
}

.edit-icon i {
    font-size: 20px; 
    color: #fff;
}
.form-control2 {
    padding-left: 1rem !important;
}

/* //////profile image///// */
.image-gallery {
  width: 100%;
  overflow-x: auto;

  /* padding: 20px; */
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  justify-content: center;
}

.image-item {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  /* border-radius: 8px; */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.image-item:hover {
  transform: scale(1.05);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

/* //////////images/////////// */
.image-gallery {
    width: 100%;
    overflow-x: auto; /* Allows horizontal scrolling if needed */
}

.image-flex-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 0;
}

.image-item {
    flex: 0 0 auto;
    width: 150px; /* Adjust this value as needed */
    aspect-ratio: 1 / 1;
    overflow: hidden;
    flex-wrap: wrap;
    /* border-radius: 8px; */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    display: flex;
    justify-content: center;
    align-items: center;
}

.image-item:hover {
    transform: scale(1.05);
}

.image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-item .card {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

.image-item img,
.image-item :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    margin: 0;
    padding: 0;
}

/* Ensure Preview component images also stretch properly */
.image-item :deep(.p-image) {
    width: 100%;
    height: 100%;
}

.image-item :deep(.p-image img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

@media (max-width: 768px) {
    .image-item {
        width: 150px; /* Smaller size for mobile devices */
    }
}
</style>