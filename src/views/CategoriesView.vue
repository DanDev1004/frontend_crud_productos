<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import BaseModal from '../components/BaseModal.vue'
import { get, send, toPage } from '../services/api'
import type { Category, CategoryPayload } from '../types'

const categories = ref<Category[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const notice = ref('')
const search = ref('')
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const page = ref(1)
const lastPage = ref(1)
const form = reactive({ name: '', description: '' })

const isEditing = computed(() => editingId.value !== null)
const filtered = computed(() => categories.value.filter((item) =>
  `${item.name} ${item.description ?? ''}`.toLowerCase().includes(search.value.toLowerCase()),
))

async function loadCategories() {
  loading.value = true
  error.value = ''
  try {
    const result = toPage<Category>(await get(`/categories?page=${page.value}`))
    categories.value = result.items
    page.value = result.currentPage
    lastPage.value = result.lastPage
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar categorías.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.name = ''
  form.description = ''
  formError.value = ''
  modalOpen.value = true
}

function openEdit(category: Category) {
  editingId.value = category.id
  form.name = category.name
  form.description = category.description ?? ''
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  if (!saving.value) modalOpen.value = false
}

async function saveCategory() {
  saving.value = true
  formError.value = ''
  const payload: CategoryPayload = { name: form.name.trim(), description: form.description.trim() || null }
  try {
    await send(isEditing.value ? `/categories/${editingId.value}` : '/categories', isEditing.value ? 'PUT' : 'POST', payload)
    notice.value = isEditing.value ? 'Categoría actualizada.' : 'Categoría creada.'
    modalOpen.value = false
    await loadCategories()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'No se pudo guardar.'
  } finally {
    saving.value = false
  }
}

async function removeCategory(category: Category) {
  if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return
  error.value = ''
  try {
    await send(`/categories/${category.id}`, 'DELETE')
    notice.value = 'Categoría eliminada.'
    await loadCategories()
    if (!categories.value.length && page.value > 1) {
      page.value--
      await loadCategories()
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo eliminar.'
  }
}

async function changePage(next: number) {
  if (next < 1 || next > lastPage.value) return
  page.value = next
  await loadCategories()
}

onMounted(loadCategories)
</script>

<template>
  <section>
    <div class="page-heading">
      <div><span class="eyebrow">ORGANIZACIÓN</span><h1>Categorías</h1><p>Clasifica y organiza tu catálogo.</p></div>
      <button class="btn btn-primary" @click="openCreate">+ Nueva categoría</button>
    </div>

    <p v-if="notice" class="alert success">{{ notice }}</p>
    <p v-if="error" class="alert error">{{ error }}</p>

    <div class="table-card">
      <div class="table-toolbar"><h2>Listado de categorías</h2><input v-model="search" class="search-input" placeholder="Buscar categoría..." aria-label="Buscar categoría" /></div>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Nombre</th><th>Descripción</th><th class="actions-col">Acciones</th></tr></thead>
          <tbody>
            <tr v-for="category in filtered" :key="category.id">
              <td class="cell-primary">{{ category.name }}</td>
              <td class="muted">{{ category.description || 'Sin descripción' }}</td>
              <td><div class="table-actions"><button class="btn btn-small" @click="openEdit(category)">Editar</button><button class="btn btn-small btn-danger" @click="removeCategory(category)">Eliminar</button></div></td>
            </tr>
            <tr v-if="!loading && !filtered.length"><td colspan="3" class="empty-state">No hay categorías para mostrar.</td></tr>
            <tr v-if="loading"><td colspan="3" class="empty-state">Cargando categorías...</td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer"><span>{{ filtered.length }} categorías en esta página</span><div v-if="lastPage > 1" class="pagination"><button :disabled="page === 1" @click="changePage(page - 1)">Anterior</button><span>{{ page }} / {{ lastPage }}</span><button :disabled="page === lastPage" @click="changePage(page + 1)">Siguiente</button></div></div>
    </div>

    <BaseModal :open="modalOpen" :title="isEditing ? 'Editar categoría' : 'Nueva categoría'" @close="closeModal">
      <form class="entity-form" @submit.prevent="saveCategory">
        <p v-if="formError" class="alert error">{{ formError }}</p>
        <label>Nombre <span>*</span><input v-model="form.name" maxlength="150" required placeholder="Ej. Electrónica" /></label>
        <label>Descripción<textarea v-model="form.description" rows="3" placeholder="Descripción opcional"></textarea></label>
        <div class="form-actions"><button type="button" class="btn" :disabled="saving" @click="closeModal">Cancelar</button><button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear categoría' }}</button></div>
      </form>
    </BaseModal>
  </section>
</template>
