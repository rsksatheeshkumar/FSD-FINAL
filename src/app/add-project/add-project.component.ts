import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl }  from '@angular/forms';
import { first } from 'rxjs/operators';
import { ToastrManager } from 'ng6-toastr-notifications';

import { ProjectService } from '../service/projectService';
import { UserService } from '../service/userService';
import { Project } from '../model/project-model';
import { User } from '../model/user-model';
import { ProjectSearchPipe } from '../service/searchProject';


@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css'],
})
export class AddProjectComponent implements OnInit {
  allProjectList: Project[] = [];
  addProjectForm: FormGroup;
  submitted = false;
  searchProjectList: Project[] = [];
  selectedUser: User;
  showdate: boolean = false;
  userList: User[]=[]
  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private toastrManager: ToastrManager,
    private projectSearchPipe: ProjectSearchPipe
  ) { }

  ngOnInit() {
    this.addProjectForm = this.formBuilder.group({  
      projectId: [''],    
      projectName: ['',Validators.required],
      isDateRequired: [false],
      startDate: [''],
      endDate: [''],
      priority: [0],
      managerName: [''],
      searchKey: [''],
    })

    this.initializeProject();
    this.addProjectForm.get('searchKey').valueChanges.subscribe(value => {
      this.searchProjectList = this.projectSearchPipe.transform(this.allProjectList ,value)
    });

  }

  initializeProject()
  {
    this.projectService.getAllProjects().subscribe(projects =>
      {
        this.allProjectList = projects;
        this.calculateTaskCount();        
        this.searchProjectList = projects;
      })

      this.userService.getAllUser().subscribe(users =>
        {
          this.userList = users;
        })
  }

  calculateTaskCount()
  {
    for(let project of this.allProjectList)
    {
      if(project.tasklist){
        project.totalTask = project.tasklist.length;
        let completedCount =0;
        for(let task of project.tasklist)
        {
          if(task && task.endDate)
          {
            completedCount= completedCount+1;
          }
        }
        project.completedTask = completedCount;
      }else{
        project.totalTask =0;
      }
    }
  }
  handleSelectedUserEvent(_event)
  {
    console.log("Handle Event"+_event);
    this.selectedUser =_event;
    console.log(this.selectedUser.firstName);
    this.addProjectForm.get('managerName').patchValue(this.selectedUser.firstName);
    this.submitted = false;
  }

  addProject()
  {
    console.log("Add Project submit");
    this.submitted = true;
    this.addProjectForm.markAsTouched;    
    if(this.addProjectForm.valid)       
     {
        let addProject: Project = this.addProjectForm.value;
        addProject.manager = this.selectedUser;
        addProject.completed = false;
        console.log("addproject"+addProject.projectName);
        if(addProject.projectId)
        {
          this.projectService.updateProject(addProject).subscribe(projectRes =>       
            {
              this.updateProjectList(projectRes);
              this.resetForm();
              this.toastrManager.successToastr("Project :  "+projectRes["projectName"] + " updated successfully");
            },
            error => {
              this.toastrManager.errorToastr("Failed to update Project ");
            }
            )   
        }
        else
        {
         this.projectService.addProject(addProject).subscribe(projectRes =>       
          {
            
            this.updateProjectList(projectRes);
            this.resetForm();
            this.toastrManager.successToastr("Project :  "+projectRes["projectName"] + " Added successfully");
          },
          error => {
            this.toastrManager.errorToastr("Failed to add Project ");
          }
          ) 
        }
     }
  }

  editProject(project: Project)
  {
    this.addProjectForm = this.formBuilder.group({      
      projectId: [project.projectId],
      projectName: [project.projectName, Validators.required],
      isDateRequired: [false],
      startDate: [project.startDate],
      endDate: [project.endDate],
      priority: [project.priority],
      managerName: [project.manager.firstName],
      searchKey: [''],
    })
    this.selectedUser =project.manager;
    if(project.startDate && project.endDate)
    {
      this.showdate = true;
      this.addProjectForm.get('isDateRequired').patchValue(true);
    }
  }

  suspendProject(projectId: number)
  {
    if(projectId)
    {
      this.projectService.suspendProject(projectId).subscribe(projectRes =>       
        {
          console.log("Sus res ="+projectRes);
          this.updateProjectList(projectRes);
          this.resetForm();
          this.toastrManager.successToastr("Project suspended successfully");
        },
        error => {
          this.toastrManager.errorToastr("Failed to suspended Project ");
        }
        ) 
    }
  }
  resetForm()
  {
    this.addProjectForm = this.formBuilder.group({      
      projectName: ['',Validators.required],
      isDateRequired: [false],
      startDate: [''],
      endDate: [''],
      priority: [0],
      managerName: [''],
      searchKey: [''],
    })
    this.submitted = false;  
    this.searchProjectList = this.allProjectList; 
    this.showdate = false;

  }

  updateProjectList(updateProject: any)
   {
     let projectId= updateProject["projectId"];
     this.setDateFormat(updateProject);
     if(projectId)
     {
      let projectIndex = this.allProjectList.findIndex(project => project.projectId == projectId);

      if(projectIndex >= 0)
      {
        this.allProjectList[projectIndex] = updateProject; 
      }
      else
      {
        this.allProjectList.push(updateProject);
      }
      this.calculateTaskCount();
     }
   }

   setDateFormat(project: any)
   {
    if(project["startDate"])
    {
      project["startDate"] = project["startDate"].slice(0,10).replace(/-/g,'/');
    }
    if(project["endDate"])
    {
      project["endDate"] = project["endDate"].slice(0,10).replace(/-/g,'/');
    }

   }
  dateRequired()
  {
    let isRequired = this.addProjectForm.get('isDateRequired').value;
    if(isRequired)
    {
      this.showdate = true;
      let now = new Date().toJSON().slice(0,10).replace(/-/g,'/')
      this.addProjectForm.get('startDate').patchValue(now);
      this.addProjectForm.get('endDate').setValue(now);
    }else{
      this.showdate = false;
      this.addProjectForm.get('startDate').patchValue('');
      this.addProjectForm.get('endDate').setValue('');
    }
  }

  sortByStartDate()
  {
    this.searchProjectList = this.searchProjectList.sort(function(project1, project2)
    {
      if(new Date(project1.startDate).getTime() < new Date(project2.startDate).getTime())
      {
        return -1;
      }
      return 0;         
    })
  }

  sortByEndDate()
  {
    this.searchProjectList = this.searchProjectList.sort(function(project1, project2)
    {
      if(new Date(project1.endDate).getTime() < new Date(project2.endDate).getTime())
      {
        return -1;
      }
      return 0;         
    })
  }

  sortByPriority()
  {
    this.searchProjectList = this.searchProjectList.sort(function(project1, project2)
    {
      if(project1.priority < project2.priority)
      {
        return -1;
      }
      return 0;         
    })
  }

  sortByCompleted()
  {
    this.searchProjectList = this.searchProjectList.sort(function(project1, project2)
    {
      if(project1.completed > project2.completed)
      {
        return -1;
      }
      return 0;         
    })
  }
}


export function projectDateValidator(control: AbstractControl): {[ket:string]: any} | null{
  const startDateCtrl = control.root.get('startDate')
  const endDateCtrl =control.root.get('endDate');
  const isDateRequiredCtrl =control.root.get('isDateRequired');
  if(isDateRequiredCtrl)
  {
    if(isDateRequiredCtrl.value)
    {
      if(!startDateCtrl || !startDateCtrl.value)
      {
        return {'startDateRequired':true}
      }else if(startDateCtrl && startDateCtrl.value && endDateCtrl && endDateCtrl.value)
      {
        const startDate = startDateCtrl.value;
        const endDate = endDateCtrl.value;
        if(new Date(startDate).getTime() > new Date(endDate).getTime()){
          return {'startDateInvalid':true}
        }
      }
    }else{
      return null;      
    }
  }
  return null; 
}