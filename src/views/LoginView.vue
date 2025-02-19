<template>
  <div class="login">
    <h1>Войти в Matrix</h1>
    <form @submit.prevent="login">
      <label>
        Домашний сервер:
        <input v-model="homeServer" placeholder="https://matrix.org" required />
      </label>
      <label>
        Логин:
        <input v-model="username" required />
      </label>
      <label>
        Пароль:
        <input v-model="password" type="password" required />
      </label>
      <button type="submit">Вход</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>

import { ref } from 'vue';
import { createClient } from "matrix-js-sdk";

export default {
  name: 'LoginView',
  setup() {
    const homeServer = ref('');
    const username = ref('');
    const password = ref('');
    const error = ref(null);
    if(localStorage.getItem('matrix_access_token')){
      window.location.href = '/rooms';
    }
    const login = async () => {
      error.value = null;
      try {
        const client = createClient({ baseUrl: homeServer.value });
        const response = await client.loginWithPassword(username.value, password.value);

        localStorage.setItem('matrix_access_token', response.access_token);
        localStorage.setItem('matrix_home_server', homeServer.value);
        localStorage.setItem('matrix_user_id', response.user_id);

        window.location.href = '/rooms';
      } catch (err) {
        error.value = 'Ошибка входа. Проверьте данные.';
        console.error(err);
      }
    };

    return {
      homeServer,
      username,
      password,
      error,
      login,
    };
  },
};
</script>


<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #2c2f33;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #ffffff;
  font-family: Arial, sans-serif;
}

.login h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #7289da;
}

.login form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1rem;
  color: #b9bbbe;
}

.login input {
  padding: 0.75rem;
  border: 1px solid #40444b;
  border-radius: 4px;
  background-color: #36393f;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.login input:focus {
  border-color: #7289da;
}

.login button {
  padding: 0.75rem;
  background-color: #7289da;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login button:hover {
  background-color: #677bc4;
}

.login button:active {
  background-color: #5b6eae;
}

.error {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f04747;
  color: #ffffff;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}
</style>