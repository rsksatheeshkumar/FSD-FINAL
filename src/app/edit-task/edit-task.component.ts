import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';

import { TaskService } from '../service/taskService';
import { Task, ParentTask } from '../model';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
  editTaskForm: FormGroup;
  taskId: number;
  editTask: Task = new Task();
  allParentTask: Array<ParentTask> = new Array<ParentTask>();
  submitted = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private toastrManager: ToastrManager

  ) {
    this.editTaskForm = this.formBuilder.group({
      task: [this.editTask.task, Validators.required],
      taskId: ['', Validators.required],
      parentTaskId: [''],
      priority: [0, Validators.required],
      startDate: ['', dateValidator],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.taskId = params['taskId']
    })

    this.taskService.getTaskById(this.taskId).subscribe(task => {
      this.editTask = task;
      this.editTask.parentTaskId
      if (this.editTask.parentTask) {
        this.editTask.parentTaskId = this.editTask.parentTask.parentTaskId;
      }
      this.editTaskForm.patchValue(this.editTask);
    })

    this.getParentTask();
  }

  getParentTask() {
    let parentTaskAry = JSON.parse(localStorage.getItem('parentTask'))
    for (let parentTask of parentTaskAry) {
      this.allParentTask.push(new ParentTask(parentTask["parentTaskId"], parentTask["parentTask"]));
    }
  }

  updateTask() {
    this.submitted = true;
    this.editTaskForm.markAsTouched;
    if(this.editTaskForm.valid){
      let task: Task = this.editTaskForm.value;
      this.taskService.updateTask(task).subscribe(task => {
        this.router.navigate(['/viewTask'])
        this.toastrManager.successToastr("Task "+task["task"] + " Updated successfully");
      },
      error => {
        this.toastrManager.errorToastr("Failed to update task ");
      }
);  
    }
  }
}

function dateValidator(control: AbstractControl): {[ket:string]: any} | null{
  const startDateCtrl = control.root.get('startDate');
  const endDateCtrl = control.root.get('endDate');
  if(!startDateCtrl || !startDateCtrl.value)
  {
    return {'startDateRequired':true}
  }else if(startDateCtrl && endDateCtrl && startDateCtrl.value && endDateCtrl.value){
    const startDate = startDateCtrl.value; 
    const endDate = endDateCtrl.value;
    if(new Date(startDate).getTime() > new Date(endDate).getTime()){
      return {'startDateInvalid':true}
    }else{
      return null;
    }    
  }
}
