package com.proyecto_final.tienda_adso;

import com.proyecto_final.tienda_adso.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestDBConnection implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;

    public TestDBConnection(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) {
        System.out.println("🔎 Probando conexión con la base de datos...");

        // Contar registros
        long total = usuarioRepository.count();
        System.out.println("📊 Total de usuarios en la tabla: " + total);

        // Listar usuarios
        usuarioRepository.findAll().forEach(usuario ->
                System.out.println("✅ Usuario encontrado: " 
                        + usuario.getUserid() + " | " 
                        + usuario.getNombre() + " | " 
                        + usuario.getPassword())
        );
    }
}