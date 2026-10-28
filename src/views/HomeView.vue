<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home-page">
    <section class="welcome-panel">
      <span class="eyebrow">PANEL DE ADMINISTRACIÓN</span>
      <h1>Todo tu inventario, en un solo lugar.</h1>
      <p>Gestiona tus productos y categorías de forma rápida, ordenada y sencilla.</p>
      <RouterLink to="/products" class="btn btn-primary">Ver productos <span>→</span></RouterLink>
      <div class="welcome-decoration">✦</div>
    </section>

    <div class="section-heading"><h2>Accesos rápidos</h2><p>¿Qué deseas administrar hoy?</p></div>
    <div class="quick-grid">
      <RouterLink to="/products" class="quick-card">
        <span class="quick-icon violet">▦</span>
        <h3>Productos</h3>
        <p>Consulta el inventario, modifica precios, stock y categorías.</p>
        <span class="quick-link">Administrar productos →</span>
      </RouterLink>
      <RouterLink to="/categories" class="quick-card">
        <span class="quick-icon blue">▤</span>
        <h3>Categorías</h3>
        <p>Organiza tus productos creando y editando categorías.</p>
        <span class="quick-link">Administrar categorías →</span>
      </RouterLink>
    </div>
  </div>
</template>
