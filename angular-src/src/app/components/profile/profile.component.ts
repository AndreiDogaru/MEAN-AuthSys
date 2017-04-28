import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ValidateService } from '../../services/validate.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: Object;
  password: string;
  newPassword: string;
  showAlert: boolean = false;
  deleteCount: number = 0;
  @ViewChild('autoShownModal') private autoShownModal: ModalDirective;
  private isModalShown: boolean = true;

  constructor(private authService: AuthService,
              private flashMessage: FlashMessagesService,
              private validateService: ValidateService,
              private router: Router) { }

  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
    }, err => {
      console.log(err);
      return false;
    });
  }

  public showModal():void {
    this.isModalShown = true;
    console.log('show modal');
  }

  public hideModal():void {
    this.autoShownModal.hide();
    console.log('hide modal');
  }

  public onHidden():void {
    this.isModalShown = false;
    console.log('onHidden');
  }

  onChangePasswordSubmit(){
    const user = {
      username: this.user['username'],
      password: this.password,
      newPassword: this.newPassword
    }

    // Custom Validations
    if(this.validateService.isUndefined(user.password) || this.validateService.isUndefined(user.newPassword)){
      this.flashMessage.show('Please fill in all fields.', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    this.authService.changePassword(user).subscribe(data => {
      if(data.success){
        this.flashMessage.show(data.msg, {cssClass: 'alert-success', timeout: 3000});
      }else{
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
      }
    });

    this.password = '';
    this.newPassword = '';
  }

  onDeleteAccountSubmit(){
    if(this.deleteCount == 0){
      this.deleteCount ++;
      this.showAlert = true;
    }else{
      const user = {
        username: this.user['username']
      }

      this.authService.deleteUser(user).subscribe(data => {
        if(data.success){
          this.flashMessage.show(data.msg, {cssClass: 'alert-success', timeout: 3000});
          this.authService.logout();
          this.router.navigate(['/register']);
        }else{
          this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
        }
      });
    }
  }

  onHideAlert(){
    this.showAlert = false;
  }
}
