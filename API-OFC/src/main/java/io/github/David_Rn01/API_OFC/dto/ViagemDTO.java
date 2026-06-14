package io.github.David_Rn01.API_OFC.dto;

import io.github.David_Rn01.API_OFC.model.TipoViagem;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ViagemDTO {
    private String rota;
    private TipoViagem tipo;
    private LocalDate data;
    private LocalTime horario;
    private String motoristaNome;
    private String veiculoPlaca;
}
