package com.proyecto_final.tienda_adso.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.proyecto_final.tienda_adso.model.usuario;
import com.proyecto_final.tienda_adso.repository.UsuarioRepository;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository){
        this.usuarioRepository = usuarioRepository;
    }

    public List<usuario> listaUsuarios(){
        return usuarioRepository.findAll();
    }

    public usuario guardarUsuario(usuario usuario){
        return usuarioRepository.save(usuario);
    }

    public usuario login(String nombre, String password){
        return usuarioRepository.findByNombreAndPassword(nombre, password);
    }
}
