<template>
  <div class="rooms">
    <h1>Ваши чаты</h1>
    <div class="controls">
      <button @click="logout">Выйти</button>
    </div>
    <input v-model="searchKeyword" placeholder="Поиск..." />
    <div class="sort-controls">
      <label for="sort-by">Сортировать по:</label>
      <select id="sort-by" v-model="sortBy">
        <option value="lastEvent">Последнему событию</option>
        <option value="alphabet">Алфавиту</option>
      </select>
    </div>
    <div v-if="loading">Загрузка...</div>
    <div v-else>
      <ul>
        <li v-for="room in filteredRooms" :key="room.roomId">
          <div class="room-info">
            <div class="room-avatar-container">
              <img :src="room.avatar" alt="Аватар не доступен" v-if="room.avatar" />
              <p v-else>Аватар отсутствует</p>
            </div>
            <div>
              <h3>{{ room.name }}</h3>
              <p>{{ room.lastEvent }}</p>
              <small>Непрочитанные: {{ room.unreadCount }}</small>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { createClient } from 'matrix-js-sdk';

export default {
  name: 'RoomsView',

  setup() {
    const rooms = ref([]);
    const searchKeyword = ref('');
    const loading = ref(true);
    const sortBy = ref('lastEvent'); // По умолчанию сортировка по последнему событию

    const loadRooms = async () => {
      loading.value = true;

      const client = createClient({
        baseUrl: localStorage.getItem('matrix_home_server'),
        accessToken: localStorage.getItem('matrix_access_token'),
        userId: localStorage.getItem('matrix_user_id'),
      });

      await client.startClient();

      client.once('sync', async (state) => {
        if (state === 'PREPARED') {
          const matrixRooms = client.getRooms();

          rooms.value = matrixRooms.map((room) => {
            const lastEvent = room.timeline?.[room.timeline.length - 1]?.event;
            return {
              roomId: room.roomId,
              name: room.name || 'Без названия',
              lastEvent: lastEvent?.content?.body || 'Нет сообщений',
              lastEventTimestamp: lastEvent?.origin_server_ts || 0, // Время последнего события
              unreadCount: room.getUnreadNotificationCount('total'),
              avatar: room.getAvatarUrl(client.getHomeserverUrl(), 50, 50, 'crop', true),
            };
          });

          loading.value = false;
        }
      });
    };

    onMounted(() => {
      loadRooms();
    });

    const filteredRooms = computed(() => {
      let sortedRooms = rooms.value.filter((room) =>
        room.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
      );

      if (sortBy.value === 'lastEvent') {
        // Сортировка по последнему событию (от нового к старому)
        sortedRooms.sort((a, b) => b.lastEventTimestamp - a.lastEventTimestamp);
      } else if (sortBy.value === 'alphabet') {
        // Сортировка по алфавиту
        sortedRooms.sort((a, b) => a.name.localeCompare(b.name));
      }

      return sortedRooms;
    });

    return { rooms, searchKeyword, loading, filteredRooms, sortBy };
  },
  methods: {
    logout() {
      localStorage.removeItem('matrix_access_token');
      localStorage.removeItem('matrix_home_server');
      localStorage.removeItem('matrix_user_id');
      window.location.href = '/';
    },
  },
};
</script>


<style scoped>
.rooms {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #2c2f33;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #ffffff;
  font-family: Arial, sans-serif;
}

.rooms h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #7289da;
}

.controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.controls button {
  padding: 0.5rem 1rem;
  background-color: #f04747;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.controls button:hover {
  background-color: #d84040;
}

.controls button:active {
  background-color: #c03939;
}

input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #40444b;
  border-radius: 4px;
  background-color: #36393f;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #7289da;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: #36393f;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

li:hover {
  background-color: #40444b;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.room-info img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.room-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #ffffff;
}

.room-info p {
  margin: 0.25rem 0;
  color: #b9bbbe;
  font-size: 0.9rem;
}

.room-info small {
  color: #7289da;
  font-size: 0.8rem;
}

.loading {
  text-align: center;
  color: #b9bbbe;
  font-size: 1rem;
}
.room-avatar-container{
  width: 70px;
  height: 70px;
  background-color: #7289da;
  font-size: small;
  text-align: center;
  color: #fff;
}
.room-avatar-container p{
  font-size: small;
  text-align: center;
  color: #fff;
}
.sort-controls {
  margin: 10px 0;
}

.sort-controls label {
  margin-right: 10px;
}
</style>