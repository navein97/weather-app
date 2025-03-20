<template>
  <div class="profile">
    <header>
      <div class="back-button" @click="goBack">
        <img src="/icons/back-icon.svg" alt="Back" />
      </div>
      <h1>Edit Profile</h1>
      <div class="placeholder"></div>
    </header>

    <div class="profile-content">
      <div class="avatar-container">
        <div class="avatar-wrapper">
          <img :src="'/images/default-avatar.png'" alt="Profile" class="avatar" />
          <div v-if="isEditing" class="edit-icon-overlay">
            <img :src="'/icons/edit-icon.svg'" alt="Edit" class="edit-icon" />
          </div>
        </div>
      </div>

      <form @submit.prevent="handleEdit">
        <div class="form-group">
          <label>Full name</label>
          <input
            type="text"
            v-model="profile.fullName"
            :disabled="!isEditing"
            :class="{ error: formErrors.fullName }"
          />
          <span class="error-message" v-if="formErrors.fullName">
            {{ formErrors.fullName }}
          </span>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            v-model="profile.email"
            :disabled="!isEditing"
            :class="{ error: formErrors.email }"
          />
          <span class="error-message" v-if="formErrors.email">
            {{ formErrors.email }}
          </span>
        </div>

        <div class="form-group">
          <label>Phone number</label>
          <input
            type="tel"
            v-model="profile.phone"
            :disabled="!isEditing"
            :class="{ error: formErrors.phone }"
          />
          <span class="error-message" v-if="formErrors.phone">
            {{ formErrors.phone }}
          </span>
        </div>

        <div class="button-group">
          <button type="submit" class="primary-button">
            {{ isEditing ? 'SUBMIT' : 'EDIT' }}
          </button>

          <button v-if="isEditing" type="button" class="secondary-button" @click="cancelEdit">
            CANCEL
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Profile {
  fullName: string
  email: string
  phone: string
}

interface FormErrors {
  fullName: string
  email: string
  phone: string
}

const router = useRouter()
const isEditing = ref(false)
const formErrors = ref<FormErrors>({
  fullName: '',
  email: '',
  phone: '',
})

const profile = ref<Profile>({
  fullName: 'Jane Doe',
  email: 'jane@gmail.com',
  phone: '123-456-7890',
})

// Keep original values for cancel functionality
const originalProfile = ref<Profile>({ ...profile.value })

const validateForm = (): boolean => {
  let isValid = true
  formErrors.value = {
    fullName: '',
    email: '',
    phone: '',
  }

  // Name validation
  if (!profile.value.fullName.trim()) {
    formErrors.value.fullName = 'Name is required'
    isValid = false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(profile.value.email)) {
    formErrors.value.email = 'Please enter a valid email'
    isValid = false
  }

  // Phone validation
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/
  if (!phoneRegex.test(profile.value.phone)) {
    formErrors.value.phone = 'Phone format: XXX-XXX-XXXX'
    isValid = false
  }

  return isValid
}

const handleEdit = () => {
  if (!isEditing.value) {
    // Start editing
    originalProfile.value = { ...profile.value }
    isEditing.value = true
    return
  }

  // Submit changes
  if (validateForm()) {
    // Save changes
    originalProfile.value = { ...profile.value }
    isEditing.value = false
    // Save to localStorage for persistence
    localStorage.setItem('userProfile', JSON.stringify(profile.value))
  }
}

const cancelEdit = () => {
  // Restore original values
  profile.value = { ...originalProfile.value }
  isEditing.value = false
  formErrors.value = {
    fullName: '',
    email: '',
    phone: '',
  }
}

const goBack = () => {
  if (isEditing.value) {
    if (confirm('Are you sure? Any unsaved changes will be lost.')) {
      cancelEdit()
      router.go(-1)
    }
  } else {
    router.go(-1)
  }
}

// Load saved profile on component mount
onMounted(() => {
  const savedProfile = localStorage.getItem('userProfile')
  if (savedProfile) {
    const parsed = JSON.parse(savedProfile)
    profile.value = parsed
    originalProfile.value = { ...parsed }
  }
})
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

h1 {
  color: #000000;
  flex-grow: 1;
  text-align: center;
  margin: 0;
  font-size: 24px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.edit-icon-overlay {
  position: absolute;
  right: -4px; /* Adjust position to slightly overlap */
  bottom: -4px;
  background: white;
  border-radius: 50%;
  width: 32px; /* Fixed width and height for perfect circle */
  height: 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex; /* Center the icon */
  align-items: center;
  justify-content: center;
}

.edit-icon {
  width: 16px;
  height: 16px;
}

.profile {
  padding: 16px;
  background: white;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.back-icon {
  width: 24px;
  height: 24px;
  margin-right: 16px;
  cursor: pointer;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-group input.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.button-group {
  margin-top: 32px;
  display: flex;
  gap: 12px;
}

.primary-button {
  flex: 1;
  padding: 12px;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background: #1e40af;
}

.secondary-button {
  flex: 1;
  padding: 12px;
  background: white;
  color: #1e3a8a;
  border: 1px solid #1e3a8a;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.secondary-button:hover {
  background: #f8fafc;
}
</style>
