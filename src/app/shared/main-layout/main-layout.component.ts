import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  sidebarVisible: boolean = false;
  menuItems: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.loadMenuItems();
    });
  }

  loadMenuItems(): void {
    if (this.currentUser?.profile?.role === 'admin') {
      this.menuItems = [
        { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/admin/dashboard' },
        { label: 'Crear Oferta', icon: 'pi pi-plus', routerLink: '/admin/job-posts/new' }
      ];
    } else if (this.currentUser?.profile?.role === 'applicant') {
      this.menuItems = [
        { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/applicant/dashboard' },
        { label: 'Mis Postulaciones', icon: 'pi pi-list', routerLink: '/applicant/applications' },
        { label: 'Mi Perfil', icon: 'pi pi-user', routerLink: '/applicant/profile' }
      ];
    } else {
      this.menuItems = [];
    }

    this.userMenuItems = [
      { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
    ];

    // Add command to close sidebar on menu item click
    this.menuItems.forEach(item => {
      if (item.routerLink) {
        item.command = () => this.closeSidebar();
      }
    });
  }

  closeSidebar(): void {
    this.sidebarVisible = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
