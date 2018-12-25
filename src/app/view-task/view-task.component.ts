import { Router  } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder }  from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';


import { TaskService } from '../service/taskService';
import { Task , ParentTask } from '../model/task-model';

@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css']
})
export class ViewTaskComponent implements OnInit {
  allTasks: Task[] = [];
  allParentTask: Array<ParentTask> =new Array<ParentTask>();
  viewTaskForm: FormGroup;
  public taskDesc: string;
  constructor(
    private taskService: TaskService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastrManager: ToastrManager

  ) { }

  ngOnInit() {
    this.viewTaskForm = this.formBuilder.group({        
      taskDesc: new FormControl()
    })
    this.getParentTask();
    this.refreshData();
  }

  refreshData()
  {
    this.taskService.getAllTask().subscribe(tasks =>
      {
        this.allTasks = tasks;
      })
  }

  updateTask(taskId){        
      this.router.navigate(['/editTask']);
  }

  endTask(task: Task){    
    this.taskService.closeTask(task).subscribe(task =>
      {
        if(task != null)
        {
          this.toastrManager.successToastr("Task "+task["task"] + " closed successfully");
          this.refreshData();
        }
      },
      error => {
        this.toastrManager.errorToastr("Failed to close task ");
      }
      );    
  }

  getParentTask()
  {
    let parentTaskAry = JSON.parse(localStorage.getItem('parentTask'))
    for(let parentTask of parentTaskAry)
    {
      this.allParentTask.push(new ParentTask(parentTask["parentTaskId"], parentTask["parentTask"]));
    }
  }
}
