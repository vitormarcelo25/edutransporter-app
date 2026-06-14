package io.github.David_Rn01.API_OFC.controller;

import io.github.David_Rn01.API_OFC.dto.AlunoDTO;
import io.github.David_Rn01.API_OFC.dto.AlunoRespostaDTO;
import io.github.David_Rn01.API_OFC.dto.LoginDTO;
import io.github.David_Rn01.API_OFC.services.AlunoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/aluno")
public class AlunoController {

    @Autowired
    private AlunoService alunoService;

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody AlunoDTO alunoDTO){
        try{
            AlunoRespostaDTO aluno = alunoService.cadastrar(alunoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(aluno);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO){
        try{
            boolean permisao = alunoService.login(loginDTO);
            return ResponseEntity.ok(permisao);
        } catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/deletar/{cpf}")
    public ResponseEntity<?> excluir(@PathVariable String cpf){
        try{
            alunoService.excluir(cpf);
            return ResponseEntity.ok("Aluno excluido com sucesso");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
