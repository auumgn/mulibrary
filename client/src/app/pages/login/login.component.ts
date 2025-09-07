import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SupabaseService } from "src/app/core/services/supabase.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  signUpForm: FormGroup;

  loading = false;
  signUpLoading = false;
  resetLoading = false;

  showPassword = false;
  showForgotPassword = false;
  showSignUpForm = false;

  errorMessage = "";
  successMessage = "";
  resetEmail = "";

  constructor(private fb: FormBuilder, private supabaseService: SupabaseService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.signUpForm = this.fb.group({
      fullName: [""],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Clear any existing messages
    this.clearMessages();
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.clearMessages();

    const { email, password } = this.loginForm.value;

    try {
      const { error } = (await this.supabaseService.signIn(email, password)) as any;

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.successMessage = "Login successful! Redirecting...";
        setTimeout(() => {
          this.router.navigate(["/"]);
        }, 1000);
      }
    } catch (error: any) {
      this.errorMessage = "An unexpected error occurred. Please try again.";
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isSignUpFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private clearMessages() {
    this.errorMessage = "";
    this.successMessage = "";
  }
}
