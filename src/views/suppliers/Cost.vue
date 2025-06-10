<template>
  <Layout>
    <div class="page-wrapper">
      <div class="page-content">
        <div class="container-fluid">
          <BreadCrumb title="Setup Cost" icon="bx bx-list-ul" />
          <div class="card">
            <div class="card-body">
              <div class="d-lg-flex align-items-center mb-4 gap-3">
                <div class="ms-auto">
                  <button @click="addRow" class="btn radius-30 mt-2 mt-lg-0 maz-gradient-btn">
                    <i class="bx bxs-plus-square"></i> Add New Row
                  </button>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Item</th>
                      <th>Rate</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in rows"
                      :key="index"
                      @click="selectedRow = index"
                      @click.outside="removeBorders"
                    >
                      <td>
                        <input 
                          ref="itemRef"
                          type="text"
                          v-model="row.item"
                          :class="{'borderless-input': selectedRow !== index}"
                          placeholder="Enter Item"
                          class="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          v-model="row.rate"
                          @input="updateAmount(index)"
                          :class="{'borderless-input': selectedRow !== index}"
                          placeholder="Enter Rate"
                          class="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          v-model="row.quantity"
                          @input="updateAmount(index)"
                          :class="{'borderless-input': selectedRow !== index}"
                          placeholder="Enter Quantity"
                          class="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          v-model="row.amount"
                          :disabled="true"
                          class="form-control"
                        />
                      </td>
                      <td>
                        <div class="d-flex order-actions">
                          <a href="javascript:;" @click="removeRow(index)" class="ms-3 text-danger">
                            <i class="bx bxs-trash"></i>
                          </a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="invoice overflow-auto">
                <div style="min-width: 600px">
                  <main>
                    <table>
                      <tfoot>
                        <tr>
                          <td colspan="2"></td>
                          <td colspan="2">SUBTOTAL</td>
                          <td>R {{ totalAmount }}</td>
                        </tr>
                        <tr>
                          <td colspan="2"></td>
                          <td colspan="2">GRAND TOTAL</td>
                          <td>R {{ totalAmount }}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </main>
                </div>
                
                <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
                <div></div>
              </div>
              <div class="d-lg-flex mt-3 align-items-center mb-4 gap-3">
                <div class="ms-auto">
                  <button 
                    v-if="rows.length > 0" 
                    @click="previewInvoice" 
                    class="btn radius-30 mt-2 mt-lg-0 maz-gradient-btn">
                    Preview
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card flex justify-center">
      <Drawer v-model:visible="visible" position="right" header="Preview Costs" style="width: 40%">
        <div class="card">
					<div class="card-body">
						<div id="invoice">
							<div class="toolbar hidden-print">
                
								<div class="d-flex gap-3 justify-content-end">
                  <button @click="onSubmit" :disabled="totalAmount == '00'" type="button" class="d-flex  justify-content-center align-items-center btn maz-gradient-btn">
                    <i class="bx bx-send"></i><span>Send</span></button>
                  <button @click="exportToPDF" type="button" class="d-flex  justify-content-center align-items-center btn maz-gradient-btn">
                    <i class="bx bx-export"></i>
                    <span>Export as PDF</span>
                  </button>
								</div>
								<hr>
							</div>
							<div class="invoice overflow-auto" id="my-invoice" style="background-color: #fff; color: black" >
								<div style="min-width: 600px">
									<header>
										<div class="row">
											<div class="col">
												<a href="javascript:;">
													<!-- <img src="assets/images/logo-icon.png" width="80" alt=""> -->
												</a>
											</div>
											<div class="col company-details">
												<h2 class="name">
									<a target="_blank" href="javascript:;">
									{{ user.firstName + ' ' + user.lastName }}
									</a>
								</h2>
												<!-- <div>110 Caldon Drive, Kempton Park</div> -->
												<div>{{ user.phone }}</div>
												<div>{{ user.email }}</div>
											</div>
										</div>
									</header>
									<main>
										<table class="table table-hover table-striped">
											<thead>
												<tr>
													<th class="text-primary">#</th>
													<th class="text-left text-dark">Item</th>
													<th class="text-right text-dark">Rate</th>
													<th class="text-right text-dark">Quantity</th>
													<th class="text-right text-dark">TOTAL</th>
												</tr>
											</thead>
											<tbody>
												<tr v-for="(row, index) in rows" :key="index">
													<td class="text-dark">{{ index + 1 }}</td>
													<td class="text-left text-dark">
														<h3>
										      </h3>
											<a target="_blank" href="javascript:;">
                              {{ row.item }}
									   </a>
                    </td>
													<td class="text-dark">{{ row.rate }}</td>
													<td class="text-dark">{{ row.quantity }}</td>
													<td class="text-dark fw-bold">{{ row.amount }}</td>
												</tr>
											</tbody>
											<tfoot>
												<tr>
													<td colspan="2 text-dark"></td>
													<td colspan="2 text-dark ">TOTAL</td>
													<td>R {{ totalAmount }}</td>
												</tr>
											</tfoot>
										</table>
									
                    
									</main>
								</div>
								<!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
								<div>

                </div>
							</div>
						</div>
					</div>
				</div>
      </Drawer>
  </div>
  </Layout>
</template>

<script setup>
import html2pdf from "html2pdf.js";
import { onClickOutside } from '@vueuse/core'
import { ref, computed } from 'vue';
import Layout from '../shared/Layout.vue';
import Drawer from 'primevue/drawer';
import { useAuth } from "@/stores/auth";
import { useSupplier } from "@/stores/supplier";
import BreadCrumb from "@/components/BreadCrumb.vue";
import useToaster from "@/composables/useToaster";
import { useRoute } from "vue-router";

const route = useRoute();
const authStore = useAuth();
const supplierStore = useSupplier();
const toaster = useToaster();
const user = JSON.parse(authStore.user);
const taskId = ref(route.params.id);
const bidId = ref(route.params.bidId);
console.log('Params',route.params);
const rows = ref([
  { item: '', rate: 0, quantity: 1, amount: '0' }
]);

// Reactive property to track selected row
const selectedRow = ref(null);

// Method to add a new row
const addRow = () => {
  rows.value.push({ item: '', rate: 0, quantity: 0, amount: 0 });
};

// Method to remove a row by index
const removeRow = (index) => {
  rows.value.splice(index, 1);
  selectedRow.value = null;
};

// Method to update the amount when rate or quantity changes
const updateAmount = (index) => {
  const row = rows.value[index];
  row.amount = row.rate * row.quantity;
};

// Computed property to calculate the total amount
const totalAmount = computed(() =>
  rows.value.reduce((sum, row) => sum + row.amount, 0)
);

// Method to remove input borders when clicking outside
const removeBorders = () => {
  selectedRow.value = null;
};

const visible = ref(false)
const previewInvoice = () => {
  visible.value = true
}
const exportPDF = () => {
      
}
const clickOutside = (el, binding) => {
  onClickOutside(el, () => binding.value());
};

const exportToPDF = () => {
      html2pdf(document.getElementById("my-invoice"), {
        margin: 1,
      filename: "generated-pdf.pdf",
      });
    }

    const onSubmit = () => {
      supplierStore.submitBid(rows.value, bidId.value).then(response => {
        toaster.success("Costs submitted successfully");
        //reset rows
        rows.value = [
          { item: '', rate: 0, quantity: 1, amount: '0' }
        ]
        visible.value = false
      }).catch(error => {
        toaster.error("Error submitting form");
        console.log(error);
      })
    }
  
</script>

<style scoped>
.text-blue {
  color: #019BFE;
}

/* Custom class to remove borders */
.borderless-input {
  border: none !important;
  background-color: transparent;
}

html.dark-theme a {
    color: black;
    text-decoration: none;
}
</style>
