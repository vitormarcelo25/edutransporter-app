package io.github.David_Rn01.API_OFC.controller;

import io.github.David_Rn01.API_OFC.model.Cidade;
import io.github.David_Rn01.API_OFC.services.CidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cidade")
public class CidadeController {

    @Autowired
    private CidadeService cidadeService;

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody Cidade cidade){
        try{
            Cidade novaCidade = cidadeService.cadastrarCidade(cidade);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaCidade);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
