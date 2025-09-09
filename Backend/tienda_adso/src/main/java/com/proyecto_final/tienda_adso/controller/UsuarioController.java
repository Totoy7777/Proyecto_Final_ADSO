package com.proyecto_final.tienda_adso.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.proyecto_final.tienda_adso.model.usuario;
import com.proyecto_final.tienda_adso.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Para que react pueda conectarse

public class UsuarioController {

    public final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<usuario> geUsuarios(){
        return usuarioService.listaUsuarios();
    }

    @PostMapping
    public usuario creUsuario(@RequestBody usuario usuario){
        return usuarioService.guardarUsuario(usuario);
    }


    
}
