<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseModal from '../components/BaseModal.vue'
import { get, send, toPage } from '../services/api'
import type { Category, Product, ProductPayload } from '../types'

const products = ref<Product[]>([])
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
const form = reactive({ name: '', description: '', price: '', stock: 0, category_id: 0 })

const isEditing = computed(() => editingId.value !== null)
const categoryName = (product: Product) => product.category?.name ?? categories.value.find((item) => item.id === Number(product.category_id))?.name ?? 'Sin categoría'
const filtered = computed(() => products.value.filter((item) =>
  `${item.name} ${item.description ?? ''} ${categoryName(item)}`.toLowerCase().includes(search.value.toLowerCase()),
))
const money = (value: number | string) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(value))

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    const result = toPage<Product>(await get(`/products?page=${page.value}`))
    products.value = result.items
    page.value = result.currentPage
    lastPage.value = result.lastPage
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar productos.'
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    // Reúne todas las páginas para que el formulario permita seleccionar cualquier categoría.
    const first = toPage<Category>(await get('/categories?page=1'))
    const all = [...first.items]
    for (let current = 2; current <= first.lastPage; current++) {
      const next = toPage<Category>(await get(`/categories?page=${current}`))
      all.push(...next.items)
    }
    categories.value = all
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudieron cargar las categorías.'
  }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', description: '', price: '', stock: 0, category_id: 0 })
  formError.value = ''
  modalOpen.value = true
}

function openEdit(product: Product) {
  editingId.value = product.id
  Object.assign(form, {
    name: product.name,
    description: product.description ?? '',
    price: String(product.price),
    stock: product.stock,
    category_id: Number(product.category_id),
  })
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  if (!saving.value) modalOpen.value = false
}

async function saveProduct() {
  saving.value = true
  formError.value = ''
  const payload: ProductPayload = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: Number(form.price),
    stock: Number(form.stock),
    category_id: Number(form.category_id),
  }
  try {
    await send(isEditing.value ? `/products/${editingId.value}` : '/products', isEditing.value ? 'PUT' : 'POST', payload)
    notice.value = isEditing.value ? 'Producto actualizado.' : 'Producto creado.'
    modalOpen.value = false
    await loadProducts()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'No se pudo guardar.'
  } finally {
    saving.value = false
  }
}

async function removeProduct(product: Product) {
  if (!window.confirm(`¿Eliminar el producto "${product.name}"?`)) return
  error.value = ''
  try {
    await send(`/products/${product.id}`, 'DELETE')
    notice.value = 'Producto eliminado.'
    await loadProducts()
    if (!products.value.length && page.value > 1) {
      page.value--
      await loadProducts()
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo eliminar.'
  }
}

async function changePage(next: number) {
  if (next < 1 || next > lastPage.value) return
  page.value = next
  await loadProducts()
}

onMounted(async () => {
  await Promise.all([loadProducts(), loadCategories()])
})
</script>

<template>
  <section>
    <div class="page-heading">
      <div><span class="eyebrow">INVENTARIO</span><h1>Productos</h1><p>Controla tu catálogo, precios y existencias.</p></div>
      <button class="btn btn-primary" :disabled="!categories.length" @click="openCreate">+ Nuevo producto</button>
    </div>

    <p v-if="notice" class="alert success">{{ notice }}</p>
    <p v-if="error" class="alert error">{{ error }}</p>
    <p v-if="!categories.length" class="alert info">Primero crea una categoría para registrar productos. <RouterLink to="/categories">Ir a categorías</RouterLink></p>

    <div class="table-card">
      <div class="table-toolbar"><h2>Listado de productos</h2><input v-model="search" class="search-input" placeholder="Buscar producto..." aria-label="Buscar producto" /></div>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th class="actions-col">Acciones</th></tr></thead>
          <tbody>
            <tr v-for="product in filtered" :key="product.id">
              <td><strong class="cell-primary">{{ product.name }}</strong><small class="item-description">{{ product.description || 'Sin descripción' }}</small></td>
              <td><span class="pill">{{ categoryName(product) }}</span></td>
              <td class="cell-primary">{{ money(product.price) }}</td>
              <td><span :class="['stock', Number(product.stock) > 0 ? 'in-stock' : 'out-stock']">{{ product.stock }}</span></td>
              <td><div class="table-actions"><button class="btn btn-small" @click="openEdit(product)">Editar</button><button class="btn btn-small btn-danger" @click="removeProduct(product)">Eliminar</button></div></td>
            </tr>
            <tr v-if="!loading && !filtered.length"><td colspan="5" class="empty-state">No hay productos para mostrar.</td></tr>
            <tr v-if="loading"><td colspan="5" class="empty-state">Cargando productos...</td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer"><span>{{ filtered.length }} productos en esta página</span><div v-if="lastPage > 1" class="pagination"><button :disabled="page === 1" @click="changePage(page - 1)">Anterior</button><span>{{ page }} / {{ lastPage }}</span><button :disabled="page === lastPage" @click="changePage(page + 1)">Siguiente</button></div></div>
    </div>

    <BaseModal :open="modalOpen" :title="isEditing ? 'Editar producto' : 'Nuevo producto'" @close="closeModal">
      <form class="entity-form" @submit.prevent="saveProduct">
        <p v-if="formError" class="alert error">{{ formError }}</p>
        <label>Nombre <span>*</span><input v-model="form.name" maxlength="150" required placeholder="Ej. Teclado mecánico" /></label>
        <label>Descripción<textarea v-model="form.description" rows="3" placeholder="Descripción opcional"></textarea></label>
        <label>Categoría <span>*</span><select v-model.number="form.category_id" required><option :value="0" disabled>Selecciona una categoría</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label>
        <div class="form-grid">
          <label>Precio (S/) <span>*</span><input v-model="form.price" type="number" min="0" step="0.01" required placeholder="0.00" /></label>
          <label>Stock <span>*</span><input v-model.number="form.stock" type="number" min="0" step="1" required /></label>
        </div>
        <div class="form-actions"><button type="button" class="btn" :disabled="saving" @click="closeModal">Cancelar</button><button type="submit" class="btn btn-primary" :disabled="saving || !form.category_id">{{ saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto' }}</button></div>
      </form>
    </BaseModal>
  </section>
</template>
