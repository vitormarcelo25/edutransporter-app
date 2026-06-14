package io.github.David_Rn01.API_OFC.controller;

import io.github.David_Rn01.API_OFC.dto.FaculdadeDTO;
import io.github.David_Rn01.API_OFC.model.Faculdade;
import io.github.David_Rn01.API_OFC.services.FaculdadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/faculdade")
public class FaculdadeController {

    @Autowired
    private FaculdadeService faculdadeService;

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody FaculdadeDTO dto){
        try{
            Faculdade novaFaculade = faculdadeService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaFaculade);
        } catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
