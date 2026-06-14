package io.github.David_Rn01.API_OFC.controller;

import io.github.David_Rn01.API_OFC.dto.PresencaDTO;
import io.github.David_Rn01.API_OFC.dto.PresencaRespostaDTO;
import io.github.David_Rn01.API_OFC.services.PresencaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/presenca")
public class PresencaController {
    @Autowired
    private PresencaService presencaService;

    @PostMapping("/marcar")
    public ResponseEntity<?> marcar(@RequestBody PresencaDTO presencaDTO){
        try{
            PresencaRespostaDTO presenca = presencaService.marcar(presencaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(presenca);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/desmarcar/{id}")
    public ResponseEntity<?> desmarcar(@PathVariable Integer id){
        try{
            presencaService.desmarcar(id);
            return ResponseEntity.ok("Desmarcado");
        } catch ( IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
