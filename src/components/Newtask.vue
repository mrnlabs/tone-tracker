<template>
    <div class="">
      <!-- <div class="crm-header">
        <img src="https://img.icons8.com/ios-filled/50/ffffff/calculator.png" alt="CRM Logo" />
        <h1>CRM</h1>
      </div> -->
      <div class="table-container-colour p-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5>Main tasks to set up</h5>
          <button class="btn btn-primary maz-gradient-btn" @click="showModal = true">Add New Task</button>
        </div>
        <table class="table table-dark table-bordered">
          <thead>
            <tr class="table-dark-color">
              <th>Project</th>
              <th>Task</th>
              <th>Risk</th>
              <th>Planned End date</th>
              <th>Time Record</th>
              <th>Project Responsible</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(task, index) in tasks" :key="index" :class="index % 2 === 0 ? 'table-dark-black' : 'table-dark-light'">
              <td>{{ task.project }}</td>
              <td>{{ task.task }}</td>
              <td :class="'risk-' + task.risk.toLowerCase().replace(' ', '-')">{{ task.risk }}</td>
              <td>{{ task.plannedEndDate }}</td>
              <td>{{ task.timeRecord }}</td>
              <td>{{ task.projectResponsible }}</td>
              <td>{{ task.completion }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- <b-modal v-model="showModal" hide-footer title="Create Task">
        <form @submit.prevent="submitTask">
          <div class="form-custom">
            <div class="d-flex justify-content-between space">
              <div class="form-group w-100 m">
                <label for="project">Project</label>
                <input type="text" class="form-control" id="project" v-model="newTask.project">
              </div>
              <div class="form-group w-100">
                <label for="task">Task</label>
                <input type="text" class="form-control" id="task" v-model="newTask.task">
              </div>
            </div>
            <div class="d-flex justify-content-between space">
              <div class="form-group w-100">
                <label for="risk">Risk</label>
                <select class="form-control" id="risk" v-model="newTask.risk">
                  <option>At risk</option>
                  <option>On track</option>
                  <option>Planned</option>
                  <option>Delayed</option>
                </select>
              </div>
              <div class="form-group w-100">
                <label for="plannedEndDate">Planned End Date</label>
                <input type="date" class="form-control" id="plannedEndDate" v-model="newTask.plannedEndDate">
              </div>
            </div>
            <div class="d-flex justify-content-between space">
              <div class="form-group w-100">
                <label for="timeRecord">Time Record</label>
                <input type="time" class="form-control" id="timeRecord" v-model="newTask.timeRecord">
              </div>
              <div class="form-group w-100">
                <label for="projectResponsible">Project Responsible</label>
                <input type="text" class="form-control" id="projectResponsible" v-model="newTask.projectResponsible">
              </div>
            </div>
            <div class="form-group">
              <label for="completion">Completion</label>
              <input type="number" class="form-control" id="completion" v-model="newTask.completion">
            </div>
          </div>
          <button type="submit" class="btn submit-button w-100">Submit</button>
        </form>
      </b-modal> -->
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        showModal: false,
        tasks: [
          { project: 'Project 1', task: '0021', risk: 'At risk', plannedEndDate: '08-09-2023', timeRecord: '04:00:00', projectResponsible: 'Brandley', completion: 17 },
          { project: 'Project 2', task: '0034', risk: 'On track', plannedEndDate: '08-09-2023', timeRecord: '05:10:00', projectResponsible: 'Michael', completion: 28 },
          { project: 'Project 3', task: '0042', risk: 'On track', plannedEndDate: '08-09-2023', timeRecord: '08:13:00', projectResponsible: 'John', completion: 34 },
          { project: 'Project 4', task: '0051', risk: 'Planned', plannedEndDate: '08-09-2023', timeRecord: '00:18:00', projectResponsible: 'Thomas', completion: 10 },
          { project: 'Project 5', task: '0058', risk: 'On track', plannedEndDate: '08-09-2023', timeRecord: '13:05:00', projectResponsible: 'Mark', completion: 94 },
          { project: 'Project 6', task: '0060', risk: 'Delayed', plannedEndDate: '08-09-2023', timeRecord: '06:32:00', projectResponsible: 'Sid', completion: 25 },
        ],
        newTask: {
          project: '',
          task: '',
          risk: '',
          plannedEndDate: '',
          timeRecord: '',
          projectResponsible: '',
          completion: ''
        }
      }
    },
    methods: {
      submitTask() {
        this.tasks.push({ ...this.newTask });
        this.resetNewTask();
        this.showModal = false;
      },
      resetNewTask() {
        this.newTask = {
          project: '',
          task: '',
          risk: '',
          plannedEndDate: '',
          timeRecord: '',
          projectResponsible: '',
          completion: ''
        };
      }
    }
  }
  </script>
  
  <style scoped>
  
  body {
    background-color: #1e1e1e;
    color: white;
    font-family: Arial, sans-serif;
  }
  
  .crm-header {
    display: flex;
    align-items: center;
    padding: 20px;
    padding-left: 0;
  }
  
  .crm-header img {
    width: 50px;
    margin-right: 15px;
  }
  
  .crm-header h1 {
    margin: 0;
  }
  
  .table-dark {
    background-color: #2c2c2c;
  }
  
  .btn-export,
  .btn-download {
    margin: 10px 0;
  }
  
  .table-container-colour {
    background-color: #0F0F0F !important;
  }
  
  .table-dark-color {
    background-color: #252525;
  }
  
  .table-dark-black {
    background-color: #0F0F0F;
  }
  
  .table-dark-light {
    background-color: #504f4f;
  }
  
  .table-dark td,
  .table-dark th,
  .table-dark thead th {
    padding: 10px !important;
    border: none !important;
  }
  
  .filter-dropdown {
    position: relative;
    display: inline-block;
  }
  
  .filter-dropdown-content {
    display: none;
    position: absolute;
    background-color: #1e90ff;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
  
  .filter-dropdown-content a {
    color: white;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }
  
  .filter-dropdown-content a:hover {
    background-color: #0056b3;
  }
  
  .filter-icon {
    width: 20px;
    margin-left: 10px;
    cursor: pointer;
  }
  
  .show {
    display: block;
  }
  
  .modal-content {
    background-color: #1e1e1e;
    color: white;
  }
  
  .modal-header,
  .modal-footer {
    border: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .risk-at-risk {
    background-color: #ff0055;
    color: white;
  }
  
  .risk-on-track {
    background-color: #00d2ff;
    color: white;
  }
  
  .risk-planned {
    background-color: #ffa500;
    color: white;
  }
  
  .risk-delayed {
    background-color: #b200ff;
    color: white;
  }
  
  .submit-button {
    background: linear-gradient(90deg, #9b00ff, #00d2ff);
    border: none;
  }
  
  .form-control {
    background-color: transparent;
    border: 1px solid #5e5e5e;
    color: white;
  }
  
  .form-control:focus {
    background-color: #1e1e1e;
    border-color: #5e5e5e;
  }
  
  .btn-primary {
    background: linear-gradient(90deg, #9b00ff, #00d2ff);
    border: none;
  }
  
  .btn-primary:hover {
    background: linear-gradient(90deg, #9b00ff, #00d2ff);
    opacity: 0.8;
  }
  
  .custom-close {
    background-color: transparent;
    border: none;
    color: white;
    font-size: 20px;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .custom-close:hover {
    background-color: #555;
  }
  
  .form-custom {
    border-radius: 5px;
    border: 2px solid #5e5e5e;
    margin: 0px;
    padding: 20px;
  }
  
  .modal-header {
    border-bottom: 1px solid #5e5e5e;
  }
  
  .modal-dialog {
    max-width: 800px;
  }
  
  .space {
    display: flex;
    gap: 15px;
  }
  
  input:focus,
  button:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  </style>
  