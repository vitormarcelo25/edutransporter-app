package io.github.David_Rn01.API_OFC.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MotoristaRespostaDTO {
    private String nome;
    private String numeroCelular;
    private String carteiraConducao;
    private String nomeCidade;
}
