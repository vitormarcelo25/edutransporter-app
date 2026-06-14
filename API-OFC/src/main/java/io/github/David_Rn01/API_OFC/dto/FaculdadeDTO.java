package io.github.David_Rn01.API_OFC.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class FaculdadeDTO {
    private String nome;
    private String endereco;
    private String nomeCidade;
    private String nomeEstado;
}
