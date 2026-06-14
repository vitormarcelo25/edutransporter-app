package io.github.David_Rn01.API_OFC.controller;

import io.github.David_Rn01.API_OFC.dto.LoginDTO;
import io.github.David_Rn01.API_OFC.dto.MotoristaDTO;
import io.github.David_Rn01.API_OFC.dto.MotoristaRespostaDTO;
import io.github.David_Rn01.API_OFC.services.MotoristaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/motorista")
public class MotoristaController {

    @Autowired
    private MotoristaService motoristaService;

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody MotoristaDTO motoristaDTO){
        try{
            MotoristaRespostaDTO motorista = motoristaService.cadastrar(motoristaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(motorista);
        } catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO){
        try{
            motoristaService.Login(loginDTO);
            return ResponseEntity.ok("Acesso permitido");
        } catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
