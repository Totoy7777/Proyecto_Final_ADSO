package com.proyecto_final.tienda_adso.model;

import java.math.BigInteger;

import jakarta.persistence.*;


@Entity
@Table(name = "usuarios")

public class usuario {
    @Id
    private int userId;

    private String nombre;
    private String email;
    private String password;
    private String direccion;
    private BigInteger telefono;

    public usuario(){}

    public usuario(String nombre, String email, String password, String direccion, BigInteger telefono){
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.direccion = direccion;
        this.telefono = telefono;
    }

    public int getUserid(){return userId;}
    public String getNombre(){return nombre;}
    public String getEmail(){return email;}
    public String getPassword(){return password;}
    public String getDireccion(){return direccion;}
    public BigInteger getTelefono(){return telefono;}

    public void setUserid(int userId){this.userId = userId;}
    public void setNombre(String nombre){this.nombre = nombre;}
    public void setEmail(String email){this.email = email;}
    public void setPassword(String password){this.password = password;}
    public void setDireccion(String direccion){this.direccion = direccion;}
    public void setTelefono(BigInteger telefono){this.telefono = telefono;}

    public boolean loginValido(String nombre, String password){
        return this.nombre.equals(nombre) && this.password.equals(password);
    }
}
