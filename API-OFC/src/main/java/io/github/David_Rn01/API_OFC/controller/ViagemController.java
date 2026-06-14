package io.github.David_Rn01.API_OFC.controller;

import io.github.David_Rn01.API_OFC.dto.ViagemDTO;
import io.github.David_Rn01.API_OFC.repository.ViagemRepository;
import io.github.David_Rn01.API_OFC.services.ViagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/viagem")
public class ViagemController {

    @Autowired
    private ViagemService viagemService;

    @PostMapping("/criar")
    public ResponseEntity<?> novaViagem(@RequestBody ViagemDTO viagemDTO){
        try{
            viagemService.cadastrar(viagemDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Viagem criada");
        } catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e);
        }
    }
}
